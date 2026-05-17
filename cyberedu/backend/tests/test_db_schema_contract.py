"""
Contract test: ожидаемые таблицы Prisma присутствуют; legacy SQLAlchemy schema отсутствует.

Запуск с живой БД:
  DATABASE_URL=postgresql://... pytest tests/test_db_schema_contract.py -v

В CI без Postgres тест пропускается.
"""

from __future__ import annotations

import os

import pytest
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.exc import OperationalError

# Таблицы Prisma (имена в PostgreSQL)
PRISMA_OWNED_TABLES = frozenset(
    {
        "User",
        "Account",
        "Session",
        "VerificationToken",
        "Profile",
        "Course",
        "Module",
        "Lesson",
        "AiAdaptation",
        "Test",
        "Question",
        "Answer",
        "TestAttempt",
        "TestAttemptAnswer",
        "PracticalTask",
        "Submission",
        "Progress",
        "Certificate",
        "Review",
        "UserAchievement",
        "course_progress",
        "tutor_chat_thread",
        "tutor_chat_message",
        "security_audit_log",
    }
)

# Параллельная snake_case схема (Alembic create_all) — не должна создаваться
LEGACY_SQLALCHEMY_TABLES = frozenset(
    {
        "users",
        "profiles",
        "courses",
        "modules",
        "lessons",
        "lesson_blocks",
        "tests",
        "questions",
        "answers",
        "test_attempts",
        "test_attempt_answers",
        "practical_tasks",
        "submissions",
        "progress",
        "ai_adaptations",
        "ai_messages",
        "certificates",
        "reviews",
        "achievements",
        "glossary_terms",
    }
)


def _database_url() -> str | None:
    url = os.environ.get("DATABASE_URL", "").strip()
    if not url:
        return None
    # SQLAlchemy 2 + psycopg3 (see requirements.txt); plain postgresql:// pulls psycopg2.
    if url.startswith("postgresql://") and "+psycopg" not in url.split("://", 1)[0]:
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


@pytest.fixture(scope="module")
def db_inspector():
    url = _database_url()
    if not url:
        pytest.skip("DATABASE_URL not set — schema contract test skipped")
    engine = create_engine(url, pool_pre_ping=True)
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        yield inspect(engine)
    except OperationalError as exc:
        pytest.skip(f"Database not reachable — schema contract test skipped ({exc})")
    finally:
        engine.dispose()


def test_prisma_tables_exist(db_inspector) -> None:
    present = set(db_inspector.get_table_names(schema="public"))
    missing = sorted(PRISMA_OWNED_TABLES - present)
    assert not missing, f"Missing Prisma-owned tables: {missing}"


def test_legacy_sqlalchemy_tables_absent(db_inspector) -> None:
    present = set(db_inspector.get_table_names(schema="public"))
    overlap = sorted(LEGACY_SQLALCHEMY_TABLES & present)
    assert not overlap, (
        "Legacy SQLAlchemy tables detected (split-brain). "
        f"Drop or migrate: {overlap}. See docs/DATABASE.md"
    )


def test_course_progress_has_user_fk(db_inspector) -> None:
    if "course_progress" not in db_inspector.get_table_names(schema="public"):
        pytest.skip("course_progress not present")
    fks = db_inspector.get_foreign_keys("course_progress")
    user_fks = [fk for fk in fks if fk.get("referred_table") == "User"]
    assert user_fks, "course_progress.user_id must reference User(id)"
