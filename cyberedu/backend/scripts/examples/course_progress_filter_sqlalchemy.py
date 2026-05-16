#!/usr/bin/env python3
"""Пример выборки с фильтрами через репозиторий."""

from __future__ import annotations

import os
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "src"))

from core.database import SessionLocal
from repositories.course_progress_repository import list_course_progress


def main() -> None:
    if not os.environ.get("DATABASE_URL"):
        print("Нужен DATABASE_URL", file=sys.stderr)
        sys.exit(1)
    db = SessionLocal()
    try:
        rows = list_course_progress(
            db,
            group_name="КИ-25",
            college="гуманитарный",
            course="безопасности",
            year=2,
            completed_from=datetime(2026, 4, 1, tzinfo=timezone.utc),
            completed_to=datetime(2026, 6, 1, tzinfo=timezone.utc),
        )
        for r in rows:
            print(r.id, r.full_name, r.group_name, r.year, r.completed_at.isoformat())
    finally:
        db.close()


if __name__ == "__main__":
    main()
