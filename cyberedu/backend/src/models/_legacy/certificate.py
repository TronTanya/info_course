from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base
from models.mixins import UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from models._legacy.course import Course
    from models._legacy.user import User


class Certificate(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "certificates"
    __table_args__ = (
        UniqueConstraint("user_id", "course_id", name="uq_certificates_user_course"),
        UniqueConstraint("certificate_number", name="uq_certificates_number"),
        UniqueConstraint("verification_code", name="uq_certificates_verification"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    certificate_number: Mapped[str] = mapped_column(String(64), nullable=False)
    verification_code: Mapped[str] = mapped_column(String(64), nullable=False)
    pdf_url: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="certificates", foreign_keys=[user_id])
    course: Mapped["Course"] = relationship("Course", back_populates="certificates")
