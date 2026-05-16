"""Заготовки под JWT и bcrypt (полная реализация — на следующих этапах)."""

from datetime import UTC, datetime, timedelta
from typing import Any

from jose import JWTError, jwt

from core.config import settings


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Совместимость с passlib — будет использовано при переносе auth."""
    _ = (plain_password, hashed_password)
    raise NotImplementedError("Реализуется при переносе аутентификации на backend")


def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(tz=UTC) + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict[str, Any] | None:
    try:
        return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError:
        return None
