from __future__ import annotations

import uuid
from datetime import date
from typing import Optional

from sqlalchemy import Date, Enum as SAEnum, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base
from models.enums import UserRole
from models.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class User(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("email", name="uq_users_email"),)

    email: Mapped[str] = mapped_column(String(320), nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole, name="user_role", native_enum=True), nullable=False, index=True)

    profile: Mapped[Optional["Profile"]] = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    test_attempts: Mapped[list["TestAttempt"]] = relationship("TestAttempt", back_populates="user", cascade="all, delete-orphan")
    submissions: Mapped[list["Submission"]] = relationship("Submission", back_populates="user", cascade="all, delete-orphan")
    progress_rows: Mapped[list["Progress"]] = relationship("Progress", back_populates="user", cascade="all, delete-orphan")
    ai_adaptations: Mapped[list["AiAdaptation"]] = relationship("AiAdaptation", back_populates="user", cascade="all, delete-orphan")
    ai_messages: Mapped[list["AiMessage"]] = relationship("AiMessage", back_populates="user", cascade="all, delete-orphan")
    certificates: Mapped[list["Certificate"]] = relationship("Certificate", back_populates="user", cascade="all, delete-orphan")
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="user")
    achievements: Mapped[list["Achievement"]] = relationship("Achievement", back_populates="user", cascade="all, delete-orphan")


class Profile(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "profiles"
    __table_args__ = (UniqueConstraint("user_id", name="uq_profiles_user_id"),)

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    last_name: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str] = mapped_column(String(255), nullable=False)
    middle_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    birth_date: Mapped[date] = mapped_column(Date, nullable=False)
    educational_institution: Mapped[str] = mapped_column(Text, nullable=False)
    city: Mapped[str] = mapped_column(String(255), nullable=False)
    specialty: Mapped[str] = mapped_column(Text, nullable=False)
    interests: Mapped[str] = mapped_column(Text, nullable=False)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="profile")
