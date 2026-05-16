"""ORM-модели: импортируйте пакет `models` до вызова Alembic / create_all, чтобы metadata была полной."""

from models.ai import AiAdaptation, AiMessage
from models.assessment import Answer, Question, Test, TestAttempt, TestAttemptAnswer
from models.base import Base
from models.certificate import Certificate
from models.course import Course, Lesson, LessonBlock, Module
from models.course_progress import CourseProgress
from models.enums import (
    AiAdaptationMode,
    AiMessageRole,
    CheckType,
    LessonBlockType,
    ModuleDifficulty,
    PracticalTaskType,
    QuestionType,
    SubmissionStatus,
    UserRole,
)
from models.glossary import Achievement, GlossaryTerm
from models.practice import PracticalTask, Submission
from models.progress import Progress
from models.review import Review
from models.user import Profile, User

__all__ = [
    "Base",
    "User",
    "Profile",
    "Course",
    "Module",
    "Lesson",
    "LessonBlock",
    "Test",
    "Question",
    "Answer",
    "TestAttempt",
    "TestAttemptAnswer",
    "PracticalTask",
    "Submission",
    "Progress",
    "AiAdaptation",
    "AiMessage",
    "Certificate",
    "Review",
    "Achievement",
    "GlossaryTerm",
    "CourseProgress",
    "UserRole",
    "ModuleDifficulty",
    "LessonBlockType",
    "QuestionType",
    "PracticalTaskType",
    "CheckType",
    "SubmissionStatus",
    "AiAdaptationMode",
    "AiMessageRole",
]
