import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from api.routes.v1.router import api_v1_router
from core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    if os.getenv("SKIP_DB_LIFESPAN_CHECK") == "1":
        yield
        return
    from core.database import engine

    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as exc:  # pragma: no cover — проверка при старте контейнера
        raise RuntimeError(
            "DATABASE_URL: не удалось подключиться к PostgreSQL. "
            "Проверьте переменную окружения и доступность сервера БД.",
        ) from exc
    yield


app = FastAPI(
    title="CyberEdu API",
    version="0.1.0",
    description="FastAPI-слой платформы CyberEdu: api → services → repositories → models.",
    lifespan=lifespan,
)


def _cors_origins() -> list[str]:
    raw = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
    return raw if raw else ["http://localhost:3100", "http://127.0.0.1:3100"]


app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_v1_router, prefix="/api/v1")
