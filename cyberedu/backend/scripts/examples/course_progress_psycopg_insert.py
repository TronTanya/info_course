#!/usr/bin/env python3
"""
Пример вставки через psycopg (v3, пакет `psycopg` в requirements.txt).
Синтаксис совместим с psycopg2: connect, cursor, execute(%s), commit.

Запуск:
  export DATABASE_URL=postgresql://user:pass@localhost:15432/cyberedu
  python3 scripts/examples/course_progress_psycopg_insert.py
"""

from __future__ import annotations

import json
import os
import re
import sys
from datetime import datetime, timedelta, timezone


def dsn_from_env() -> str:
    raw = os.environ.get("DATABASE_URL", "")
    if not raw:
        print("Нужен DATABASE_URL", file=sys.stderr)
        sys.exit(1)
    return re.sub(r"^postgresql\+psycopg(?:2|g)?://", "postgresql://", raw, count=1)


def main() -> None:
    import psycopg

    completed = datetime.now(timezone.utc) - timedelta(days=5, hours=2)
    errors = json.dumps(["Ошибка 1", "Ошибка 2"], ensure_ascii=False)

    row = (
        "Миронов Эрик Сергеевич",
        "КИ-25",
        "Якутский гуманитарный колледж, группа КИ-25, 2 курс",
        "Основы информационной безопасности",
        2,
        completed,
        errors,
    )

    with psycopg.connect(dsn_from_env()) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO course_progress
                    (full_name, group_name, college, course, year, completed_at, errors)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id;
                """,
                row,
            )
            new_id = cur.fetchone()[0]
        conn.commit()
    print("inserted id:", new_id)


if __name__ == "__main__":
    main()
