from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class CourseProgressRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[str] = Field(default=None, description="Связь с учётной записью Next/Prisma (User.id)")
    full_name: str
    group_name: str
    college: str
    course: str
    year: int = Field(description="Курс обучения (1–4), не календарный год")
    completed_at: datetime
    errors: Optional[str] = None
