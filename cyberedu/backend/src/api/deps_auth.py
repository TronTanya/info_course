from __future__ import annotations

import os
import secrets
from typing import Annotated

from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader

_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def _configured_internal_api_key() -> str | None:
    raw = os.getenv("INTERNAL_API_KEY", "").strip()
    return raw if raw else None


def require_internal_api_key(
    api_key: Annotated[str | None, Security(_api_key_header)],
) -> None:
    """
    Защита внутренних read-эндпоинтов (course-progress, users).
    Всегда fail-closed: без валидного X-API-Key доступ запрещён (dev и production).
    """
    expected = _configured_internal_api_key()
    if not expected:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Internal API key is not configured.",
        )

    if not api_key or not secrets.compare_digest(api_key, expected):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key.",
        )
