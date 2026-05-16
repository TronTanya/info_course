from __future__ import annotations

import uuid
from typing import Generic, Optional, Sequence, Type, TypeVar

from sqlalchemy import select
from sqlalchemy.orm import Session

from models.base import Base

T = TypeVar("T", bound=Base)


class Repository(Generic[T]):
    """Базовый CRUD-слой над SQLAlchemy Session."""

    def __init__(self, session: Session, model: Type[T]) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, entity_id: uuid.UUID) -> Optional[T]:
        return self.session.get(self.model, entity_id)

    def list_page(self, *, offset: int = 0, limit: int = 50) -> Sequence[T]:
        stmt = select(self.model).offset(offset).limit(limit)
        return list(self.session.scalars(stmt))

    def add(self, entity: T) -> T:
        self.session.add(entity)
        self.session.flush()
        return entity

    def remove(self, entity: T) -> None:
        self.session.delete(entity)
