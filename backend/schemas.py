# schemas.py
from pydantic import BaseModel
from typing import List, Optional

class QuestionCreate(BaseModel):
    question_text: str
    options: List[str]
    correct_answer: int

class QuizCreate(BaseModel):
    title: str
    teacher_email: str
    questions: List[QuestionCreate]

class QuizJoin(BaseModel):
    access_code: str
    student_name: str

class AnswerSubmit(BaseModel):
    attempt_id: int
    question_index: int
    selected_option: int

class ViolationReport(BaseModel):
    attempt_id: int
    violation_type: str