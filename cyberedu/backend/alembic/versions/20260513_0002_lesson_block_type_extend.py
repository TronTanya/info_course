"""Расширение enum lesson_block_type: новые типы блоков лекции.

Revision ID: 0002_lesson_block_extend
Revises: 0001_initial
Create Date: 2026-05-13
"""

from alembic import op
from sqlalchemy import text

revision = "0002_lesson_block_extend"
down_revision = "0001_initial"
branch_labels = None
depends_on = None

_NEW_LABELS = (
    "why_it_matters",
    "terms",
    "beginner_mistake",
    "correct_action",
)


def upgrade() -> None:
    conn = op.get_bind()
    if conn.dialect.name != "postgresql":
        return
    with op.get_context().autocommit_block():
        for label in _NEW_LABELS:
            op.execute(text(f"ALTER TYPE lesson_block_type ADD VALUE IF NOT EXISTS '{label}'"))


def downgrade() -> None:
    pass
