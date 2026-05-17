# Operations — production, go-live, troubleshooting

Руководство для разработчика и on-call: поднять **production-like** окружение, пройти **go-live** и быстро диагностировать типовые сбои.

Связанные документы: [README.md](./README.md) · [GO_LIVE_CHECKLIST.md](./GO_LIVE_CHECKLIST.md) · [DEPLOYMENT.md](./DEPLOYMENT.md) · [DATABASE.md](./DATABASE.md) · [SECURITY.md](./SECURITY.md) · [STORAGE.md](./STORAGE.md) · [checklists/FINAL_CHECKLIST.md](./checklists/FINAL_CHECKLIST.md) · [screenshots/](./screenshots/)

---

## Production checklist

Используйте перед первым выкладом на VPS и при смене инфраструктуры (новый сервер, другой Redis/Postgres).

### Required environment variables

Файл-шаблон: [`../.env.prod.example`](../.env.prod.example). Секреты **только** в runtime (`env_file`), не в `docker build`. Проверка compose: `make -C cyberedu compose-prod-config-quiet`.

| Переменная | Обязательность | Назначение |
|------------|----------------|------------|
| `ENVIRONMENT` | **да** | `production` — отключает dev-only, включает строгие проверки |
| `RUN_SEED` | **да** | `0` на prod (никогда не сидировать демо-учётки) |
| `AUTH_SECRET` | **да** | NextAuth; `openssl rand -base64 32` |
| `JWT_SECRET_KEY` | **да** | Backend JWT; уникальный, ≥32 символов |
| `INTERNAL_API_KEY` | **да** | `X-API-Key` для FastAPI; `openssl rand -hex 32` |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | **да** | Учётные данные БД |
| `REDIS_PASSWORD` | **да** (prod compose) | Пароль Redis |
| `REDIS_URL` | **да** (prod) | В compose задаётся как `redis://:password@redis:6379/0` |
| `AUTH_URL` | **да** | Публичный HTTPS URL приложения (как в браузере) |
| `NEXT_PUBLIC_APP_URL` | **да** | Тот же origin для ссылок и metadata |
| `NEXT_PUBLIC_API_URL` | **да** | Обычно тот же домен (Nginx → `/api/v1`) |
| `CORS_ORIGINS` | **да** | Только production-домен(ы) |
| `TRUSTED_PROXY` | **да** за Nginx | `1` |
| `DATABASE_URL` | **да** (в контейнере) | Задаётся compose для frontend/backend |
| `SHOW_SEED_LOGIN_HINT` | prod | `0` |
| `OPENAI_API_KEY` | опционально | Без ключа AI-функции деградируют gracefully |
| `OPENAI_API_BASE_URL` / `OPENAI_MODEL` | при AI | Совместимый OpenAI API endpoint |

Проверка перед `up`:

```bash
cd cyberedu
grep -E 'CHANGE_ME|your-domain' .env.production && echo "⚠ Замените placeholder-значения" || echo "OK: нет очевидных placeholder"
chmod 600 .env.production
```

### PostgreSQL

| Пункт | Действие |
|-------|----------|
| Версия | PostgreSQL **16** (`postgres:16-alpine` в prod compose) |
| Сеть | Порт **не** публикуется наружу — только Docker network `internal` |
| Volume | `postgres_data` на persistent disk хоста |
| Подключение | `DATABASE_URL` у frontend/backend указывает на сервис `postgres:5432` |
| Права | Отдельный пользователь/пароль, не `postgres`/слабый пароль |

Проверка из контейнера Postgres:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production \
  exec postgres pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"
```

### Redis

| Пункт | Действие |
|-------|----------|
| Назначение | Распределённый **rate limit** (Server Actions, API); в prod **fail-closed** без Redis |
| Compose | Сервис `redis` в `docker-compose.prod.yml`, healthcheck `PING` |
| Dev | `docker-compose.yml` — Redis по умолчанию, `REDIS_URL=redis://redis:6379/0` |
| Пароль | `REDIS_PASSWORD` в `.env.production` |

Проверка через health API (при `ENVIRONMENT=production`):

```bash
curl -fsS https://your-domain/api/health | jq .
# Ожидается: checks.redis == "ok", status == "ok"
```

Локально production-like (без полного prod stack):

```bash
cd cyberedu
docker compose up -d postgres redis
# В frontend/.env: DATABASE_URL, REDIS_URL=redis://127.0.0.1:6379/0, ENVIRONMENT=production
cd frontend && npm run dev
```

### Migrations

| Среда | Команда / механизм |
|-------|-------------------|
| **Production** | One-shot сервис `frontend-migrate` → `prisma migrate deploy` **до** старта `frontend` |
| **Development** | `npx prisma migrate dev` (с хоста) или migrate при первом `docker compose up` |
| **Никогда на prod** | `prisma migrate dev`, `prisma db push` без ревью, `prisma db seed` |

При ошибке миграции **не** поднимайте приложение с половиной схемы — смотрите логи:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production logs frontend-migrate
```

Схема и Alembic: [DATABASE.md](./DATABASE.md).

### Seed policy

| Правило | Детали |
|---------|--------|
| Production | `RUN_SEED=0`, seed **отклоняется** при `ENVIRONMENT=production` |
| Development | Только `RUN_SEED=1 docker compose up` на **изолированной** машине |
| Пароли | Не в git; повторный seed **не перезаписывает** `passwordHash` существующих пользователей |
| Демо-email | `admin@cyberedu.local`, `student@cyberedu.local` — **не** использовать в prod |

Администратора в production создайте **вручную** (не через `RUN_SEED=1`) — см. раздел [Создание администратора](#создание-администратора-production) ниже.

E2E на изолированной CI-БД: `E2E_PRODUCTION_SMOKE=1` + отдельный `DATABASE_URL` (см. `frontend/e2e/test-credentials.ts`).

### Создание администратора (production)

На production **не** используйте seed-учётки `admin@cyberedu.local` / `student@cyberedu.local`.

1. **Зарегистрируйте** реальный email через `/auth/register` (или создайте пользователя через Prisma Studio на staging).
2. **Назначьте роль `ADMIN`** одним из способов:

**Через Prisma Studio** (на сервере или с туннелем к БД):

```bash
cd cyberedu/frontend
DATABASE_URL='postgresql://USER:PASS@host:5432/cyberedu?schema=public' npx prisma studio
# User → найти email → role = ADMIN
```

**Через SQL** (из контейнера Postgres):

```bash
cd cyberedu
docker compose -f docker-compose.prod.yml --env-file .env.production exec -T postgres \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -c "UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'admin@your-domain.example';"
```

3. Выйдите из сессии и войдите снова — JWT должен содержать `role: ADMIN`.
4. Откройте `/admin` — доступ только при роли `ADMIN` (проверка в middleware + server actions).

Смена роли существующего пользователя админом: UI «Пользователи» → карточка пользователя (аудит `admin.user.role_change`).

### Docker Compose command

**Production (VPS):**

```bash
cd cyberedu
cp .env.prod.example .env.production
# заполните секреты
chmod 600 .env.production

docker compose -f docker-compose.prod.yml \
  --env-file .env.production \
  up -d --build
```

**Development:**

```bash
cd cyberedu
cp .env.example .env
docker compose up --build
# с демо-курсом (только dev):
RUN_SEED=1 docker compose up --build
```

**Staging / prod E2E локально** (реальный Redis, `checks.redis: ok`):

Dev compose порты: **Redis** `127.0.0.1:6379`, **Postgres** `127.0.0.1:15432`.

```bash
cd cyberedu
docker compose up -d redis postgres
```

**Вариант A — app уже запущен** (два терминала):

```bash
# Терминал 1
cd cyberedu/frontend
npm run build
ENVIRONMENT=production \
  REDIS_URL=redis://127.0.0.1:6379 \
  DATABASE_URL=postgresql://cyberedu:cyberedu_dev_password@127.0.0.1:15432/cyberedu?schema=public \
  AUTH_SECRET=local-e2e-prod-auth-secret-minimum-32-chars \
  npm run start

# Терминал 2 — HTTP smoke + prod Playwright
cd cyberedu
CHECK_REDIS=1 BASE_URL=http://127.0.0.1:3100 REDIS_URL=redis://127.0.0.1:6379 \
  RUN_E2E=1 RUN_E2E_MODE=staging ./scripts/staging-smoke.sh

# Только Playwright prod specs (после redis-ping):
SMOKE_MODE=prod-e2e ./scripts/staging-smoke.sh
# или из frontend:
cd cyberedu/frontend && npm run smoke:prod-e2e
```

**Вариант B — всё в одном скрипте** (migrate, seed, build, start, e2e):

```bash
cd cyberedu/frontend && npm run smoke:staging:local
```

Скрипты: [`../scripts/staging-smoke.sh`](../scripts/staging-smoke.sh) · [`../scripts/e2e-prod-local.sh`](../scripts/e2e-prod-local.sh).

Без Redis: `redis-ping` и `test:e2e:prod` падают с явной ошибкой (`REDIS_URL is not set` / connection refused).

**CI job `e2e-prod-smoke`:** services `postgres` + `redis:7-alpine`, `REDIS_URL=redis://127.0.0.1:6379`, шаги `npm run redis:ping` → build → health с `checks.redis: ok` → `npm run test:e2e:staging`.

### Healthcheck

| Endpoint | Кто проверяет | Ожидание |
|----------|---------------|----------|
| `GET /api/health` | Docker healthcheck **frontend**, внешний uptime | `status: ok`, `checks.database: ok`; в prod `checks.redis: ok` |
| `GET /api/v1/health` | Backend container | `200` |
| `GET /nginx-health` | Nginx (через хост `127.0.0.1`) | `200` |

Примеры:

```bash
curl -fsS http://127.0.0.1:3100/api/health          # dev (frontend на хосте)
curl -fsS http://127.0.0.1/nginx-health             # prod через nginx
curl -fsS https://your-domain/api/health | jq .

docker compose -f docker-compose.prod.yml --env-file .env.production ps
# STATE должен быть healthy для postgres, redis, frontend, backend, nginx
```

Staging smoke (HTTP + optional E2E с Redis):

```bash
cd cyberedu
CHECK_REDIS=1 BASE_URL=https://your-domain ./scripts/staging-smoke.sh
# E2E prod specs (нужны REDIS_URL + seed app):
REDIS_URL=redis://127.0.0.1:6379 ENVIRONMENT=production \
  RUN_E2E=1 RUN_E2E_MODE=staging BASE_URL=http://127.0.0.1:3100 ./scripts/staging-smoke.sh
```

### Backup notes

**PostgreSQL** (ежедневно, хранить off-server):

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec -T postgres \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > /backups/cyberedu-$(date +%F).sql.gz
```

| Рекомендация | Значение |
|--------------|----------|
| Retention | 7 daily + 4 weekly (настройте под политику) |
| Restore test | Раз в квартал на staging |
| Uploads volume | Named volume `frontend_uploads` — бэкапить отдельно (`tar`/snapshot) |
| Секреты | Бэкап **не** должен содержать `.env.production` в открытом виде |

Подробнее: [DEPLOYMENT.md § Backups](./DEPLOYMENT.md#backups), [migrations/UPLOADS_VOLUME.md](./migrations/UPLOADS_VOLUME.md).

### Upload storage (local / S3 risk)

| Режим | Production |
|-------|------------|
| `UPLOAD_STORAGE_DRIVER=local` (default) | Named volume `frontend_uploads` → `/app/uploads` — **одна реплика** frontend |
| `s3` | **NOT IMPLEMENTED** — env зарезервирован; при выборе `s3` старт загрузки падает с явной ошибкой |

Multi-replica без shared storage → файлы «теряются» между инстансами. Стратегия и roadmap: [STORAGE.md](./STORAGE.md).

---

## Go-live checklist

Полный чеклист перед выкладкой: **[GO_LIVE_CHECKLIST.md](./GO_LIVE_CHECKLIST.md)** (CI, security tests, Redis/Postgres, uploads, ops).

Кратко: CI green → `test:e2e` + `test:e2e:staging` с real Redis → compose config → staging smoke → [FINAL_CHECKLIST](./checklists/FINAL_CHECKLIST.md).

---

## Troubleshooting

### Redis unavailable

| Симптом | Причина | Действие |
|---------|---------|----------|
| `/api/health` → `checks.redis: "error"`, `status: degraded` | Redis down, неверный `REDIS_URL`/пароль | `docker compose ps redis`; `docker compose logs redis` |
| «Слишком много отправок» на **каждой** попытке в prod | Fail-closed без Redis | Поднять Redis; проверить `REDIS_URL` в контейнере frontend |
| `checks.redis: "skipped"` в prod | `ENVIRONMENT` не `production` или нет `REDIS_URL` | Выставить `ENVIRONMENT=production` и `REDIS_URL` |

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec redis redis-cli -a "$REDIS_PASSWORD" PING
```

### Prisma migration failed

| Симптом | Действие |
|---------|----------|
| `frontend` не стартует, migrate exit ≠ 0 | `logs frontend-migrate`; исправить SQL/конфликт; **не** `db push` на prod без бэкапа |
| Drift схемы | Сверить с [DATABASE.md](./DATABASE.md); восстановить из backup при необходимости |
| Lock / timeout | Остановить app; проверить активные соединения к Postgres |

### Login / session issues

| Симптом | Действие |
|---------|----------|
| Бесконечный редирект на login | `AUTH_URL` и `NEXT_PUBLIC_APP_URL` должны совпадать с URL в браузере (схема + host) |
| Cookie не сохраняется | HTTPS в prod; `TRUSTED_PROXY=1` за Nginx; проверить `Secure` cookies |
| «Неверный пароль» после seed | Повторный seed не меняет hash — сброс пароля вручную или новый пользователь |
| Admin попадает на `/dashboard` | Ожидаемо для non-admin routes; `/admin` требует роль `ADMIN` |

### Rate limit false positive

| Симптом | Действие |
|---------|----------|
| Лимит сразу после первой отправки в prod | Проверить Redis (`checks.redis`); убедиться, что не запущено несколько инстансов с **in-memory** RL |
| Лимит в dev при активной разработке | Dev использует in-memory RL — перезапуск сбрасывает; в prod только Redis |
| E2E падает на rate limit | CI использует `ENVIRONMENT=test` (in-memory) или изолированный Redis DB index |

Server Actions должны идти через `enforceServerActionRateLimit` (см. `lib/security/server-action-rate-limit.ts`).

### File upload rejected

| Симптом | Действие |
|---------|----------|
| 413 / nginx error | Увеличить `client_max_body_size` в nginx conf |
| «Недопустимый тип файла» | Allowlist + magic bytes — см. [SECURITY.md](./SECURITY.md) |
| Файл пропал после recreate | Volume `frontend_uploads` не смонтирован — [UPLOADS_VOLUME.md](./migrations/UPLOADS_VOLUME.md) |
| Permission denied | `UPLOADS_DIR=/app/uploads`, права записи в контейнере |

### AI provider unavailable

| Симптом | Действие |
|---------|----------|
| Адаптация лекции / чат не отвечает | Проверить `OPENAI_API_KEY`, сеть, `OPENAI_API_BASE_URL` |
| 429 / timeout | Rate limit AI в коде; уменьшить нагрузку; сменить модель |
| Отказ «не могу дать ответ» на тест | **Ожидаемое** поведение (academic integrity), не баг |

Логи: `docker compose logs frontend` (без публикации ключей).

---

## UX screenshots

Каталог: [`screenshots/`](./screenshots/). Файлы в git — PNG 1280×720, **без PII** и секретов.

### Автогенерация

```bash
cd cyberedu/frontend
npm run build && npm run start    # :3100, seed
npm run screenshots
```

Playwright: `e2e/screenshots.spec.ts`, учётки `E2E_USE_SEED_CREDENTIALS` / seed defaults.

### Набор файлов

| Файл | Экран |
|------|--------|
| `01-landing.png` | Landing / home |
| `09-login.png` | Login |
| `02-dashboard.png` | Student dashboard |
| `03-course.png` | Course map |
| `04-lesson.png` | Lesson |
| `05-test.png` | Module test |
| `07-admin.png` | Admin dashboard |

Ручная съёмка и опциональные кадры: [screenshots/README.md](./screenshots/README.md).

---

## Быстрые команды (шпаргалка)

```bash
# Проверки frontend (перед PR)
cd cyberedu/frontend && npm run lint && npm run typecheck

# Unit tests
cd cyberedu/frontend && npm test

# E2E smoke (app на :3100, seed dev)
cd cyberedu/frontend && npm run test:e2e

# Prod/staging specs (real Redis + E2E_PRODUCTION_SMOKE)
cd cyberedu/frontend && npm run test:e2e:prod

# Production rate-limit guard
cd cyberedu/frontend && npm run check:rate-limit
```
