from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class UserRead(BaseModel):
    """Read-only DTO пользователя из Prisma-таблицы ``User``."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    role: Literal["USER", "ADMIN"]
    created_at: datetime = Field(validation_alias="createdAt")
    updated_at: datetime = Field(validation_alias="updatedAt")
