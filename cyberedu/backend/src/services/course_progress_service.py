from __future__ import annotations

from datetime import datetime
from typing import Optional, Sequence

from sqlalchemy.orm import Session

from models.course_progress import CourseProgress
from repositories.course_progress_repository import list_course_progress


class CourseProgressService:
    def __init__(self, session: Session) -> None:
        self._session = session

    def list_filtered(
        self,
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
        return list_course_progress(
            self._session,
            user_id=user_id,
            group_name=group_name,
            college=college,
            course=course,
            year=year,
            completed_from=completed_from,
            completed_to=completed_to,
            limit=limit,
        )
