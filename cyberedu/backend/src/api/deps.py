from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from core.database import get_db
from repositories.user_repository import UserRepository
from services.course_progress_service import CourseProgressService
from services.health_service import HealthService
from services.user_service import UserService


def get_user_repository(db: Annotated[Session, Depends(get_db)]) -> UserRepository:
    return UserRepository(db)


def get_user_service(repo: Annotated[UserRepository, Depends(get_user_repository)]) -> UserService:
    return UserService(repo)


def get_course_progress_service(db: Annotated[Session, Depends(get_db)]) -> CourseProgressService:
    return CourseProgressService(db)


def get_health_service() -> HealthService:
    return HealthService()
