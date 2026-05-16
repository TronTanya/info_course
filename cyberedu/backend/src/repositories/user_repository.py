from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from models.user import User
from repositories.base import Repository


class UserRepository(Repository[User]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, User)

    def get_by_email(self, email: str) -> Optional[User]:
        return self.session.scalar(select(User).where(User.email == email))
