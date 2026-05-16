from functools import lru_cache
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = Field(
        ...,
        description="PostgreSQL (DATABASE_URL). Обязательно для запуска API.",
    )
    redis_url: Optional[str] = Field(default=None, description="Опционально: Redis для rate limit / кэша.")
    jwt_secret_key: str = Field(
        ...,
        min_length=32,
        description="Секрет подписи JWT (JWT_SECRET_KEY), не короче 32 символов.",
    )
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    cors_origins: str = "http://localhost:3100,http://127.0.0.1:3100"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
