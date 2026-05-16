#!/usr/bin/env python3
"""
Пример одной вставки через SQLAlchemy (ORM).

Запуск из каталога backend/:
  export DATABASE_URL=postgresql+psycopg://user:pass@localhost:15432/cyberedu
  PYTHONPATH=src python3 scripts/examples/course_progress_sqlalchemy_insert.py
"""

from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "src"))

from core.database import SessionLocal
from models.course_progress import CourseProgress


def main() -> None:
    if not os.environ.get("DATABASE_URL"):
        print("Нужен DATABASE_URL", file=sys.stderr)
        sys.exit(1)

    session = SessionLocal()
    try:
        row = CourseProgress(
            full_name="Лукин Арчын Васильевич",
            group_name="КИ-25",
            college="Якутский гуманитарный колледж, группа КИ-25, 2 курс",
            course="Основы информационной безопасности",
            year=2,
            completed_at=datetime.now(timezone.utc) - timedelta(days=3, hours=1),
            errors=json.dumps(["Ошибка 1"], ensure_ascii=False),
        )
        session.add(row)
        session.commit()
        session.refresh(row)
        print("inserted id:", row.id)
    finally:
        session.close()


if __name__ == "__main__":
    main()
