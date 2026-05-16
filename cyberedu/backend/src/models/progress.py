from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base
from models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from models.course import Module
    from models.user import User


class Progress(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "progress"
    __table_args__ = (UniqueConstraint("user_id", "module_id", name="uq_progress_user_module"),)

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    module_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("modules.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    lesson_completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    video_completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    test_completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    practice_completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    module_completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    score: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")

    user: Mapped["User"] = relationship("User", back_populates="progress_rows", foreign_keys=[user_id])
    module: Mapped["Module"] = relationship("Module", back_populates="progress_rows")
