from __future__ import annotations

import os
import sys
from logging.config import fileConfig
from pathlib import Path

from alembic import context
from sqlalchemy import create_engine, pool

# src на PYTHONPATH (локально и в Docker совпадает с рабочей директорией образа)
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

import models  # noqa: E402, F401 — регистрация ORM в metadata
from models.base import Base  # noqa: E402


def _database_url_for_alembic() -> str:
    """Миграции: достаточно DATABASE_URL; JWT_SECRET_KEY не обязателен."""
    url = os.environ.get("DATABASE_URL")
    if url and url.strip():
        return url.strip()
    from core.config import settings  # noqa: E402

    return settings.database_url


config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=_database_url_for_alembic(),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    url = _database_url_for_alembic()
    if "+psycopg" in url and "psycopg2" not in url:
        try:
            import psycopg  # noqa: F401
        except ModuleNotFoundError as e:
            raise RuntimeError(
                "Не установлен драйвер psycopg (нужен для DATABASE_URL с +psycopg).\n"
                "Из каталога cyberedu/backend выполните:\n"
                "  python3 -m venv .venv && .venv/bin/pip install -r requirements.txt\n"
                "  export DATABASE_URL='postgresql+psycopg://…@localhost:15432/cyberedu'\n"
                "  .venv/bin/alembic upgrade head\n"
                "Для API/uvicorn дополнительно нужен JWT_SECRET_KEY (≥32 символов).\n"
                "Либо: ./scripts/alembic_upgrade.sh"
            ) from e

    connectable = create_engine(url, poolclass=pool.NullPool)

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
