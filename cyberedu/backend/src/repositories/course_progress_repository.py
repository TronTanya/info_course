"""Выборки по таблице course_progress с фильтрами."""

from __future__ import annotations

from datetime import datetime
from typing import Optional, Sequence

from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from models.course_progress import CourseProgress


def list_course_progress(
    session: Session,
    *,
    user_id: Optional[str] = None,
    group_name: Optional[str] = None,
    college: Optional[str] = None,
    course: Optional[str] = None,
    year: Optional[int] = None,
    completed_from: Optional[datetime] = None,
    completed_to: Optional[datetime] = None,
    limit: int = 500,
) -> Sequence[CourseProgress]:
    """Фильтрация по группе, колледжу, названию курсу, курсу обучения (year), диапазону дат прохождения."""
    q: Select[tuple[CourseProgress]] = select(CourseProgress)
    if user_id:
        q = q.where(CourseProgress.user_id == user_id)
    if group_name:
        q = q.where(CourseProgress.group_name == group_name)
    if college:
        q = q.where(CourseProgress.college.ilike(f"%{college}%"))
    if course:
        q = q.where(CourseProgress.course.ilike(f"%{course}%"))
    if year is not None:
        q = q.where(CourseProgress.year == year)
    if completed_from is not None:
        q = q.where(CourseProgress.completed_at >= completed_from)
    if completed_to is not None:
        q = q.where(CourseProgress.completed_at <= completed_to)
    q = q.order_by(CourseProgress.completed_at.desc()).limit(limit)
    return session.scalars(q).all()
