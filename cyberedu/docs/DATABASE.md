# Database ownership and migrations

Одна PostgreSQL БД, **один владелец DDL** для учебной схемы: **Prisma Migrate** (Next.js frontend).

FastAPI backend **не** создаёт таблицы через `create_all` и **не** дублирует модели `User` / `Course` / …

## Кто владеет чем

| Область | Владелец DDL | ORM в runtime | Таблицы (примеры) |
|---------|--------------|---------------|-------------------|
| Auth, курс, тесты, практика, AI, аудит | **Prisma** | Prisma (frontend) | `"User"`, `"Course"`, `"Module"`, `tutor_chat_*`, `security_audit_log` |
| Отчёт `course_progress` | **Prisma** | Prisma + SQLAlchemy `CourseProgress` (backend API/скрипты) | `course_progress` |
| Пользователь (internal API) | **Prisma** | SQLAlchemy `PrismaUser` read-only | `"User"` |

### Не использовать

- Snake_case таблицы `users`, `courses`, `lessons`, … — устаревшая параллельная схема SQLAlchemy.
- `backend/scripts/seed_initial.py` — deprecated; данные: `frontend/prisma/seed.ts` + `RUN_SEED=1`.

## Как запускать миграции

### Development / Production (обязательно)

```bash
cd cyberedu
docker compose up -d postgres
# dev: frontend entrypoint
docker compose up -d frontend   # prisma migrate deploy

# prod: one-shot migrate job
docker compose -f docker-compose.prod.yml --env-file .env.production up frontend-migrate
```

Локально (хост → Postgres из compose):

```bash
cd frontend
export DATABASE_URL="postgresql://cyberedu:cyberedu_dev_password@127.0.0.1:15432/cyberedu?schema=public"
npx prisma migrate deploy
```

### Alembic (backend)

Цепочка ревизий **no-op** (история сохранена). Новые DDL — **только Prisma**.

```bash
docker compose exec backend alembic upgrade head   # опционально, для alembic_version
```

Не запускайте старый `0001_initial` с `create_all` на чистой БД — он заменён no-op.

## Contract test

```bash
cd backend
export DATABASE_URL="postgresql://cyberedu:cyberedu_dev_password@127.0.0.1:15432/cyberedu"
pytest tests/test_db_schema_contract.py -v
```

Проверяет наличие Prisma-таблиц и отсутствие legacy `users` / `courses` / …

## Миграция с split-brain

Если в БД уже есть legacy-таблицы:

1. Убедитесь, что Prisma-таблицы заполнены (`prisma migrate deploy`, seed).
2. Сделайте backup.
3. Удалите только пустые/дублирующие legacy-таблицы (не `course_progress`, если в ней данные):

```sql
-- Пример — только после проверки, что данные не нужны
DROP TABLE IF EXISTS users CASCADE;
```

4. Прогоните `pytest tests/test_db_schema_contract.py`.

## Backend code map

- `frontend/prisma/schema.prisma` — source of truth
- `backend/src/models/course_progress.py` — запись отчётов
- `backend/src/models/prisma_reflect.py` — read-only `"User"`
- `backend/src/models/_legacy/` — старые модели (не в Alembic)
