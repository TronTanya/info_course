# syntax=docker/dockerfile:1.7
# Multi-stage: builder (wheels) → production runner (non-root)

FROM python:3.12-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt

FROM python:3.12-slim AS runner

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/src

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq5 curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 10001 app \
    && useradd --system --uid 10001 --gid app --home-dir /app --no-create-home app

WORKDIR /app

COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir /wheels/* \
    && rm -rf /wheels \
    && pip install --no-cache-dir 'uvicorn[standard]>=0.32.0'

COPY --chown=app:app src ./src
COPY --chown=app:app alembic ./alembic
COPY --chown=app:app alembic.ini .

USER app

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
  CMD curl -fsS http://127.0.0.1:8000/api/v1/health || exit 1

# Production: 2 workers; override via UVICORN_EXTRA_ARGS in compose
CMD ["sh", "-c", "exec uvicorn main:app --host 0.0.0.0 --port 8000 --app-dir /app/src --workers ${UVICORN_WORKERS:-2}"]
