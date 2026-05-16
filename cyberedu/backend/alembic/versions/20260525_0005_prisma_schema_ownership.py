"""Фиксация: Alembic больше не создаёт Prisma-owned таблицы.

Revision ID: 0005_prisma_schema_ownership
Revises: 0004_course_progress_user_fk
Create Date: 2026-05-25
"""

revision = "0005_prisma_schema_ownership"
down_revision = "0004_course_progress_user_fk"
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
