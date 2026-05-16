from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from models.prisma_reflect import PrismaUser
from repositories.base import Repository


class UserRepository(Repository[PrismaUser]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, PrismaUser)

    def get_by_id(self, user_id: str) -> Optional[PrismaUser]:
        return self.session.get(PrismaUser, user_id)

    def get_by_email(self, email: str) -> Optional[PrismaUser]:
        return self.session.scalar(select(PrismaUser).where(PrismaUser.email == email))
