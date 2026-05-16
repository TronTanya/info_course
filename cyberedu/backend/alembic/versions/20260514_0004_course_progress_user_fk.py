"""Связь course_progress с учётной записью Prisma (таблица "User").

Revision ID: 0004_course_progress_user_fk
Revises: 0003_course_progress
Create Date: 2026-05-14
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0004_course_progress_user_fk"
down_revision = "0003_course_progress"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    if "course_progress" not in insp.get_table_names():
        return
    cols = {c["name"] for c in insp.get_columns("course_progress")}
    if "user_id" in cols:
        return

    op.add_column("course_progress", sa.Column("user_id", sa.Text(), nullable=True))
    op.create_index("ix_course_progress_user_id", "course_progress", ["user_id"], unique=False)
    op.execute(
        sa.text(
            'ALTER TABLE course_progress ADD CONSTRAINT course_progress_user_id_fkey '
            'FOREIGN KEY (user_id) REFERENCES "User"("id") ON DELETE SET NULL'
        )
    )


def downgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    if "course_progress" not in insp.get_table_names():
        return
    cols = {c["name"] for c in insp.get_columns("course_progress")}
    if "user_id" not in cols:
        return

    op.execute(sa.text("ALTER TABLE course_progress DROP CONSTRAINT IF EXISTS course_progress_user_id_fkey"))
    op.drop_index("ix_course_progress_user_id", table_name="course_progress")
    op.drop_column("course_progress", "user_id")
