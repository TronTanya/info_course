from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, Enum as SAEnum, ForeignKey, Index, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base
from models.enums import QuestionType
from models.mixins import CreatedAtMixin, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from models.course import Module


class Test(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "tests"

    module_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("modules.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    min_score_percent: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    max_attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=3, server_default="3")

    module: Mapped["Module"] = relationship("Module", back_populates="tests")
    questions: Mapped[list["Question"]] = relationship(
        "Question",
        back_populates="test",
        cascade="all, delete-orphan",
        order_by="Question.order_number",
    )
    attempts: Mapped[list["TestAttempt"]] = relationship("TestAttempt", back_populates="test", cascade="all, delete-orphan")


class Question(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "questions"
    __table_args__ = (UniqueConstraint("test_id", "order_number", name="uq_questions_test_order"),)

    test_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tests.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_type: Mapped[QuestionType] = mapped_column(
        SAEnum(QuestionType, name="question_type", native_enum=True),
        nullable=False,
        index=True,
    )
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    points: Mapped[int] = mapped_column(Integer, nullable=False, default=1, server_default="1")
    order_number: Mapped[int] = mapped_column(Integer, nullable=False, index=True)

    test: Mapped["Test"] = relationship("Test", back_populates="questions")
    answers: Mapped[list["Answer"]] = relationship(
        "Answer",
        back_populates="question",
        cascade="all, delete-orphan",
        order_by="Answer.order_number",
    )
    attempt_answers: Mapped[list["TestAttemptAnswer"]] = relationship("TestAttemptAnswer", back_populates="question")


class Answer(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "answers"
    __table_args__ = (UniqueConstraint("question_id", "order_number", name="uq_answers_question_order"),)

    question_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("questions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    answer_text: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    order_number: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")

    question: Mapped["Question"] = relationship("Question", back_populates="answers")


class TestAttempt(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    __tablename__ = "test_attempts"
    __table_args__ = (Index("ix_test_attempts_user_test", "user_id", "test_id"),)

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    test_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tests.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    score: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    max_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    percent: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False, default=0, server_default="0")
    passed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")

    user: Mapped["User"] = relationship("User", back_populates="test_attempts", foreign_keys=[user_id])
    test: Mapped["Test"] = relationship("Test", back_populates="attempts")
    answers: Mapped[list["TestAttemptAnswer"]] = relationship("TestAttemptAnswer", back_populates="attempt", cascade="all, delete-orphan")


class TestAttemptAnswer(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "test_attempt_answers"
    __table_args__ = (UniqueConstraint("attempt_id", "question_id", name="uq_attempt_answers_attempt_question"),)

    attempt_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("test_attempts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    question_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("questions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    selected_answer_ids: Mapped[Optional[list[str]]] = mapped_column(JSONB, nullable=True)
    text_answer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_correct: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    points_earned: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")

    attempt: Mapped["TestAttempt"] = relationship("TestAttempt", back_populates="answers")
    question: Mapped["Question"] = relationship("Question", back_populates="attempt_answers")


__all__ = ["Answer", "Question", "Test", "TestAttempt", "TestAttemptAnswer"]
