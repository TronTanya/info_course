from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, Enum as SAEnum, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base
from models.enums import LessonBlockType, ModuleDifficulty
from models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from models._legacy.ai import AiAdaptation, AiMessage
    from models._legacy.assessment import Test
    from models._legacy.certificate import Certificate
    from models._legacy.glossary import GlossaryTerm
    from models._legacy.practice import PracticalTask
    from models._legacy.progress import Progress


class Course(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "courses"

    title: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    hours: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")

    modules: Mapped[list[Module]] = relationship("Module", back_populates="course", cascade="all, delete-orphan")
    certificates: Mapped[list[Certificate]] = relationship("Certificate", back_populates="course", cascade="all, delete-orphan")


class Module(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "modules"
    __table_args__ = (UniqueConstraint("course_id", "order_number", name="uq_modules_course_order"),)

    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    order_number: Mapped[int] = mapped_column(Integer, nullable=False)
    difficulty: Mapped[ModuleDifficulty] = mapped_column(
        SAEnum(ModuleDifficulty, name="module_difficulty", native_enum=True),
        nullable=False,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true", index=True)

    course: Mapped[Course] = relationship("Course", back_populates="modules")
    lessons: Mapped[list[Lesson]] = relationship("Lesson", back_populates="module", cascade="all, delete-orphan")
    tests: Mapped[list[Test]] = relationship("Test", back_populates="module", cascade="all, delete-orphan")
    practical_tasks: Mapped[list[PracticalTask]] = relationship("PracticalTask", back_populates="module", cascade="all, delete-orphan")
    progress_rows: Mapped[list[Progress]] = relationship("Progress", back_populates="module", cascade="all, delete-orphan")
    glossary_terms: Mapped[list[GlossaryTerm]] = relationship("GlossaryTerm", back_populates="module")
    ai_messages: Mapped[list[AiMessage]] = relationship("AiMessage", back_populates="module")


class Lesson(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "lessons"

    module_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("modules.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    intro: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    video_url: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    allow_ai_adaptation: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")

    module: Mapped[Module] = relationship("Module", back_populates="lessons")
    blocks: Mapped[list[LessonBlock]] = relationship(
        "LessonBlock",
        back_populates="lesson",
        cascade="all, delete-orphan",
        order_by="LessonBlock.order_number",
    )
    ai_adaptations: Mapped[list[AiAdaptation]] = relationship("AiAdaptation", back_populates="lesson", cascade="all, delete-orphan")
    ai_messages: Mapped[list[AiMessage]] = relationship("AiMessage", back_populates="lesson")


class LessonBlock(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "lesson_blocks"
    __table_args__ = (UniqueConstraint("lesson_id", "order_number", name="uq_lesson_blocks_lesson_order"),)

    lesson_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("lessons.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    block_type: Mapped[LessonBlockType] = mapped_column(
        SAEnum(LessonBlockType, name="lesson_block_type", native_enum=True),
        nullable=False,
        index=True,
    )
    title: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    order_number: Mapped[int] = mapped_column(Integer, nullable=False, index=True)

    lesson: Mapped[Lesson] = relationship("Lesson", back_populates="blocks")
