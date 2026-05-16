"""Фиксация прохождения курса (отдельная учётная таблица; не путать с Prisma Progress)."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base


class CourseProgress(Base):
    """
    Прохождение курса студентом.

    Колонка ``year`` в БД — «курс обучения» (1–4), не календарный год.
    Поле ``errors`` — текст (часто JSON-массив строк с ошибками).
    """

    __tablename__ = "course_progress"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[Optional[str]] = mapped_column(
        String(128),
        ForeignKey('"User".id', ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    full_name: Mapped[str] = mapped_column(Text, nullable=False)
    group_name: Mapped[str] = mapped_column(Text, nullable=False, index=True)
    college: Mapped[str] = mapped_column(Text, nullable=False, index=True)
    course: Mapped[str] = mapped_column(Text, nullable=False, index=True)
    year: Mapped[int] = mapped_column("year", Integer, nullable=False, index=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    errors: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    def __repr__(self) -> str:
        return f"<CourseProgress id={self.id} full_name={self.full_name!r}>"
