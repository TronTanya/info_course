from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Enum as SAEnum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base
from models.enums import AiAdaptationMode, AiMessageRole
from models.mixins import CreatedAtMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from models.course import Lesson, Module
    from models.practice import PracticalTask
    from models.user import User


class AiAdaptation(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    __tablename__ = "ai_adaptations"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    lesson_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("lessons.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    mode: Mapped[AiAdaptationMode] = mapped_column(
        SAEnum(AiAdaptationMode, name="ai_adaptation_mode", native_enum=True),
        nullable=False,
        index=True,
    )
    interests_used: Mapped[str] = mapped_column(Text, nullable=False)
    original_content: Mapped[str] = mapped_column(Text, nullable=False)
    adapted_content: Mapped[str] = mapped_column(Text, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="ai_adaptations", foreign_keys=[user_id])
    lesson: Mapped["Lesson"] = relationship("Lesson", back_populates="ai_adaptations")


class AiMessage(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    __tablename__ = "ai_messages"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    module_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("modules.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    lesson_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("lessons.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    practical_task_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("practical_tasks.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    role: Mapped[AiMessageRole] = mapped_column(
        SAEnum(AiMessageRole, name="ai_message_role", native_enum=True),
        nullable=False,
        index=True,
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="ai_messages", foreign_keys=[user_id])
    module: Mapped[Optional["Module"]] = relationship("Module", back_populates="ai_messages")
    lesson: Mapped[Optional["Lesson"]] = relationship("Lesson", back_populates="ai_messages")
    practical_task: Mapped[Optional["PracticalTask"]] = relationship("PracticalTask", back_populates="ai_messages")
