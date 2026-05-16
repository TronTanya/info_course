"""Deprecated: учебная схема владеет Prisma Migrate (не create_all).

Revision ID: 0001_initial
Revises:
Create Date: 2026-02-13
"""

from alembic import op

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Раньше: Base.metadata.create_all — создавало параллельные users/courses/…
    # Сейчас: только `prisma migrate deploy` на frontend.
    pass


def downgrade() -> None:
    pass
