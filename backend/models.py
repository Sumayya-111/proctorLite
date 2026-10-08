# models.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Quiz(Base):
    __tablename__ = "quizzes"
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    access_code = Column(String, unique=True, nullable=False)  # short code students use to join
    teacher_email = Column(String, nullable=False)  # where violation emails go
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    questions = relationship("Question", back_populates="quiz")
    attempts = relationship("Attempt", back_populates="quiz")


class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    question_text = Column(String, nullable=False)
    options = Column(JSON, nullable=False)        # ["A", "B", "C", "D"]
    correct_answer = Column(Integer, nullable=False)  # index into options

    quiz = relationship("Quiz", back_populates="questions")


class Attempt(Base):
    __tablename__ = "attempts"
    id = Column(Integer, primary_key=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    student_name = Column(String, nullable=False)
    answers = Column(JSON, default=list)   # [1, 0, 2, null, ...]
    score = Column(Integer, nullable=True)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)

    quiz = relationship("Quiz", back_populates="attempts")
    violations = relationship("Violation", back_populates="attempt")


class Violation(Base):
    __tablename__ = "violations"
    id = Column(Integer, primary_key=True)
    attempt_id = Column(Integer, ForeignKey("attempts.id"))
    violation_type = Column(String, nullable=False)  # "tab_switch", "blur", etc.
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    attempt = relationship("Attempt", back_populates="violations")