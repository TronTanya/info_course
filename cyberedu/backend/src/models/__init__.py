"""
ORM backend: только таблицы, не принадлежащие полной Prisma-схеме.

- ``CourseProgress`` — отчётная таблица (чтение/запись FastAPI и скриптов).
- ``PrismaUser`` — read-only отражение ``"User"`` (Prisma DDL).

Устаревшие snake_case модели — ``models/_legacy/`` (не в Alembic metadata).
"""

from models.base import Base
from models.course_progress import CourseProgress
from models.prisma_reflect import PrismaUser

__all__ = ["Base", "CourseProgress", "PrismaUser"]
