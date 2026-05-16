from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any, Dict, Optional

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base
from models.enums import CheckType, PracticalTaskType, SubmissionStatus
from models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from models._legacy.ai import AiMessage
    from models._legacy.course import Module
    from models._legacy.user import User


class PracticalTask(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "practical_tasks"

    module_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("modules.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    task_type: Mapped[PracticalTaskType] = mapped_column(
        SAEnum(PracticalTaskType, name="practical_task_type", native_enum=True),
        nullable=False,
        index=True,
    )
    check_type: Mapped[CheckType] = mapped_column(
        SAEnum(CheckType, name="check_type", native_enum=True),
        nullable=False,
        index=True,
    )
    difficulty: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default="intermediate",
        server_default="intermediate",
        index=True,
    )
    max_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    expected_answer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    expected_command: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    expected_answer_pattern: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    scenario_data: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)

    module: Mapped["Module"] = relationship("Module", back_populates="practical_tasks")
    submissions: Mapped[list["Submission"]] = relationship("Submission", back_populates="practical_task", cascade="all, delete-orphan")
    ai_messages: Mapped[list["AiMessage"]] = relationship("AiMessage", back_populates="practical_task")


class Submission(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "submissions"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    practical_task_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("practical_tasks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    text_answer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    file_url: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    auto_result: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    status: Mapped[SubmissionStatus] = mapped_column(
        SAEnum(SubmissionStatus, name="submission_status", native_enum=True),
        nullable=False,
        default=SubmissionStatus.draft,
        index=True,
    )
    admin_comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    checked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="submissions", foreign_keys=[user_id])
    practical_task: Mapped["PracticalTask"] = relationship("PracticalTask", back_populates="submissions")
