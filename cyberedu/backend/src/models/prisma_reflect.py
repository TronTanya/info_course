"""Read-only отражение таблиц Prisma (DDL владеет Prisma Migrate)."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base


class PrismaUser(Base):
    """
    Таблица `"User"` из Prisma. Backend не мутирует учебный контент через SQLAlchemy.
    """

    __tablename__ = "User"
    __table_args__ = {"extend_existing": True}

    id: Mapped[str] = mapped_column(String, primary_key=True)
    email: Mapped[str] = mapped_column(String, nullable=False)
    password_hash: Mapped[Optional[str]] = mapped_column("passwordHash", String, nullable=True)
    role: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column("createdAt", DateTime(timezone=False), nullable=False)
    updated_at: Mapped[datetime] = mapped_column("updatedAt", DateTime(timezone=False), nullable=False)
