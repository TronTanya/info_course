from __future__ import annotations

from sqlalchemy.orm import Session

from models.course import Course
from repositories.base import Repository


class CourseRepository(Repository[Course]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Course)
