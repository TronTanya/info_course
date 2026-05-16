from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from models.enums import UserRole


class ProfileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    last_name: str
    first_name: str
    middle_name: Optional[str]
    birth_date: date
    educational_institution: str
    city: str
    specialty: str
    interests: str
    avatar_url: Optional[str]
    created_at: datetime
    updated_at: datetime


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    role: UserRole
    created_at: datetime
    updated_at: datetime


class UserCreate(BaseModel):
    email: str
    password_hash: str
    role: UserRole = UserRole.user


class UserWithProfileRead(UserRead):
    profile: Optional[ProfileRead] = None
