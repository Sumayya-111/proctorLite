# main.py (or routers/quiz.py, depending on your project structure)
import random
import string
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models, schemas
import datetime
import resend
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware



load_dotenv()

app = FastAPI()
models.Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

resend.api_key = os.getenv("RESEND_API_KEY")

def send_violation_email(teacher_email: str, student_name: str, quiz_title: str, violation_type: str):
    resend.Emails.send({
        "from": "ProctorLite <onboarding@resend.dev>",
        "to": teacher_email,
        "subject": f"⚠️ Violation detected: {student_name}",
        "html": f"<p><b>{student_name}</b> triggered a <b>{violation_type}</b> violation during <b>{quiz_title}</b>.</p>"
    })

def generate_access_code():
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=5))

@app.post("/quizzes")
def create_quiz(quiz: schemas.QuizCreate, db: Session = Depends(get_db)):
    new_quiz = models.Quiz(
        title=quiz.title,
        teacher_email=quiz.teacher_email,
        access_code=generate_access_code()
    )
    db.add(new_quiz)
    db.commit()
    db.refresh(new_quiz)

    for q in quiz.questions:
        new_question = models.Question(
            quiz_id=new_quiz.id,
            question_text=q.question_text,
            options=q.options,
            correct_answer=q.correct_answer
        )
        db.add(new_question)
    db.commit()

    return {"quiz_id": new_quiz.id, "access_code": new_quiz.access_code}

@app.post("/quizzes/join")
def join_quiz(data: schemas.QuizJoin, db: Session = Depends(get_db)):
    quiz = db.query(models.Quiz).filter(models.Quiz.access_code == data.access_code).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Invalid access code")

    new_attempt = models.Attempt(
        quiz_id=quiz.id,
        student_name=data.student_name,
        answers=[None] * len(quiz.questions)
    )
    db.add(new_attempt)
    db.commit()
    db.refresh(new_attempt)

    questions_for_student = [
        {"id": q.id, "question_text": q.question_text, "options": q.options}
        for q in quiz.questions
    ]

    return {
        "attempt_id": new_attempt.id,
        "quiz_title": quiz.title,
        "questions": questions_for_student
    }


@app.post("/attempts/{attempt_id}/answer")
def submit_answer(attempt_id: int, data: schemas.AnswerSubmit, db: Session = Depends(get_db)):
    attempt = db.query(models.Attempt).filter(models.Attempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    answers = attempt.answers
    answers[data.question_index] = data.selected_option
    attempt.answers = answers
    db.commit()

    return {"status": "saved"}


@app.post("/attempts/{attempt_id}/finish")
def finish_attempt(attempt_id: int, db: Session = Depends(get_db)):
    attempt = db.query(models.Attempt).filter(models.Attempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    quiz = db.query(models.Quiz).filter(models.Quiz.id == attempt.quiz_id).first()

    score = 0
    for i, question in enumerate(quiz.questions):
        if attempt.answers[i] == question.correct_answer:
            score += 1

    attempt.score = score
    attempt.finished_at = datetime.datetime.utcnow()
    db.commit()

    return {"score": score, "total": len(quiz.questions)}


@app.post("/attempts/{attempt_id}/violation")
def log_violation(attempt_id: int, data: schemas.ViolationReport, db: Session = Depends(get_db)):
    attempt = db.query(models.Attempt).filter(models.Attempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    new_violation = models.Violation(
        attempt_id=attempt_id,
        violation_type=data.violation_type
    )
    db.add(new_violation)
    db.commit()

    quiz = db.query(models.Quiz).filter(models.Quiz.id == attempt.quiz_id).first()
    send_violation_email(quiz.teacher_email, attempt.student_name, quiz.title, data.violation_type)

    return {"status": "violation logged and email sent"}