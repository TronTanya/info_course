from __future__ import annotations

from datetime import datetime
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query

from api.deps import get_course_progress_service
from api.deps_auth import require_internal_api_key
from schemas.course_progress import CourseProgressRead
from services.course_progress_service import CourseProgressService

router = APIRouter(
    prefix="/course-progress",
    tags=["course-progress"],
    dependencies=[Depends(require_internal_api_key)],
)


@router.get("", response_model=list[CourseProgressRead])
def list_course_progress_entries(
    service: Annotated[CourseProgressService, Depends(get_course_progress_service)],
    user_id: Optional[str] = Query(None, description="Фильтр по связанному User.id (Prisma cuid)"),
    group_name: Optional[str] = Query(None, description="Точное совпадение группы, напр. КИ-25"),
    college: Optional[str] = Query(None, description="Подстрока колледжа (ILIKE)"),
    course: Optional[str] = Query(None, description="Подстрока названия курса (ILIKE)"),
    year: Optional[int] = Query(None, ge=1, le=4, description="Курс обучения (1–4)"),
    completed_from: Optional[datetime] = Query(None, description="Начало диапазона completed_at (UTC)"),
    completed_to: Optional[datetime] = Query(None, description="Конец диапазона completed_at (UTC)"),
    limit: int = Query(500, ge=1, le=2000),
) -> list[CourseProgressRead]:
    rows = service.list_filtered(
        user_id=user_id,
        group_name=group_name,
        college=college,
        course=course,
        year=year,
        completed_from=completed_from,
        completed_to=completed_to,
        limit=limit,
    )
    return list(rows)
