"""Таблица course_progress: фиксация прохождения курса студентами.

Revision ID: 0003_course_progress
Revises: 0002_lesson_block_extend
Create Date: 2026-05-14
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0003_course_progress"
down_revision = "0002_lesson_block_extend"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    if "course_progress" in insp.get_table_names():
        return

    op.create_table(
        "course_progress",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("full_name", sa.Text(), nullable=False),
        sa.Column("group_name", sa.Text(), nullable=False),
        sa.Column("college", sa.Text(), nullable=False),
        sa.Column("course", sa.Text(), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("errors", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id", name="course_progress_pkey"),
    )
    op.create_index("ix_course_progress_group_name", "course_progress", ["group_name"], unique=False)
    op.create_index("ix_course_progress_college", "course_progress", ["college"], unique=False)
    op.create_index("ix_course_progress_course", "course_progress", ["course"], unique=False)
    op.create_index("ix_course_progress_year", "course_progress", ["year"], unique=False)
    op.create_index("ix_course_progress_completed_at", "course_progress", ["completed_at"], unique=False)


def downgrade() -> None:
    op.execute(sa.text("DROP TABLE IF EXISTS course_progress CASCADE"))
