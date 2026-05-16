from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from models.enums import ModuleDifficulty


class CourseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: Optional[str]
    hours: int
    created_at: datetime
    updated_at: datetime


class ModuleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    course_id: uuid.UUID
    title: str
    description: Optional[str]
    order_number: int
    difficulty: ModuleDifficulty
    is_active: bool
    created_at: datetime
    updated_at: datetime
