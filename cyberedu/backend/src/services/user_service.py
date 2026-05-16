from __future__ import annotations

from typing import Optional

from repositories.user_repository import UserRepository
from schemas.user import UserRead


class UserService:
    def __init__(self, repo: UserRepository) -> None:
        self._repo = repo

    def get_user(self, user_id: str) -> Optional[UserRead]:
        entity = self._repo.get_by_id(user_id)
        if entity is None:
            return None
        return UserRead(
            id=entity.id,
            email=entity.email,
            role=entity.role,  # type: ignore[arg-type]
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )
