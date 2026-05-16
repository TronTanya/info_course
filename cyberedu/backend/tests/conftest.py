"""Переменные окружения до импорта приложения (обязательные поля Settings)."""

import os

os.environ.setdefault(
    "JWT_SECRET_KEY",
    "pytest-jwt-secret-key-minimum-32-characters!",
)
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+psycopg://cyberedu:cyberedu_password@127.0.0.1:5432/cyberedu",
)
os.environ.setdefault("SKIP_DB_LIFESPAN_CHECK", "1")
os.environ.setdefault(
    "INTERNAL_API_KEY",
    "pytest-internal-api-key-for-tests-only",
)
