from __future__ import annotations

from repositories.base import Repository
from repositories.course_repository import CourseRepository
from repositories.user_repository import UserRepository

__all__ = ["Repository", "UserRepository", "CourseRepository"]
