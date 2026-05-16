"""Начальная схема образовательной платформы (все таблицы + PostgreSQL ENUM).

Revision ID: 0001_initial
Revises:
Create Date: 2026-02-13
"""

from alembic import op

import models  # noqa: F401 — регистрация таблиц в Base.metadata
from models.base import Base

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    Base.metadata.create_all(bind=op.get_bind(), checkfirst=True)


def downgrade() -> None:
    Base.metadata.drop_all(bind=op.get_bind(), checkfirst=True)
