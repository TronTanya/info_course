from __future__ import annotations

import uuid
from typing import Optional

from schemas.user import UserRead
from repositories.user_repository import UserRepository


class UserService:
    def __init__(self, repo: UserRepository) -> None:
        self._repo = repo

    def get_user(self, user_id: uuid.UUID) -> Optional[UserRead]:
        entity = self._repo.get_by_id(user_id)
        return UserRead.model_validate(entity) if entity else None
