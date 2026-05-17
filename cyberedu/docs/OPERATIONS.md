# Operations — production, go-live, troubleshooting

Руководство для разработчика и on-call: поднять **production-like** окружение, пройти **go-live** и быстро диагностировать типовые сбои.

Связанные документы: [DEPLOYMENT.md](./DEPLOYMENT.md) · [DATABASE.md](./DATABASE.md) · [SECURITY.md](./SECURITY.md) · [checklists/FINAL_CHECKLIST.md](./checklists/FINAL_CHECKLIST.md) · [screenshots/](./screenshots/)

---

## Production checklist

Используйте перед первым выкладом на VPS и при смене инфраструктуры (новый сервер, другой Redis/Postgres).

### Required environment variables

Файл-шаблон: [`../.env.production.example`](../.env.production.example). Секреты **только** в runtime (`env_file`), не в `docker build`.

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

Администратора в production создайте вручную (см. [Go-live checklist](#go-live-checklist)).

E2E на изолированной CI-БД: `E2E_PRODUCTION_SMOKE=1` + отдельный `DATABASE_URL` (см. `frontend/e2e/test-credentials.ts`).

### Docker Compose command

**Production (VPS):**

```bash
cd cyberedu
cp .env.production.example .env.production
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

**Production-like E2E локально** (migrate + seed для e2e + Playwright):

```bash
cd cyberedu/frontend
npm run test:e2e:prod:local
```

Скрипт: [`../scripts/e2e-prod-local.sh`](../scripts/e2e-prod-local.sh).

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

Staging smoke (submit test + practice, Redis):

```bash
cd cyberedu
CHECK_REDIS=1 BASE_URL=https://your-domain ./scripts/staging-smoke.sh
RUN_E2E=1 BASE_URL=https://your-domain ./scripts/staging-smoke.sh
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

---

## Go-live checklist

Отмечайте `[x]` на **staging**, идентичном production (те же `ENVIRONMENT`, Redis, TLS).

### CI и тесты

- [ ] GitHub Actions **CI green** на `main`: lint, typecheck, Vitest, pytest, `prisma validate`, `npm audit --audit-level=high`
- [ ] Job **rate-limit-redis** (интеграция Redis) зелёный или осознанно skipped только локально
- [ ] **Production e2e green**: job `e2e-prod-smoke` (`ENVIRONMENT=production` + Postgres + Redis) или локально `npm run test:e2e:prod:local`
- [ ] Playwright **smoke** (`test:e2e`): login → course → test submit → practice submit → admin

### Инфраструктура

- [ ] **Redis connected**: `/api/health` → `checks.redis: "ok"` (не `skipped`, не `error`)
- [ ] **Rate limit tested** на staging: пройти тест и TEXT-практику без ложного «Слишком много отправок»; при превышении лимита — понятное сообщение (не 500)
- [ ] `npm run check:rate-limit` / CI script — нет sync `consumeRateLimit` в Server Actions
- [ ] Миграции применены; `frontend-migrate` exit 0
- [ ] Все сервисы `healthy` в `docker compose ps`

### Учётные записи и секреты

- [ ] **Admin user created securely**: отдельный email, сильный пароль, роль `ADMIN` через БД или одноразовый скрипт — **не** seed
- [ ] Демо-учётки (`*.local`) отсутствуют или отключены
- [ ] **Secrets rotated** от dev/staging: `AUTH_SECRET`, `JWT_SECRET_KEY`, `INTERNAL_API_KEY`, `POSTGRES_PASSWORD`, `REDIS_PASSWORD`
- [ ] `.env.production` не в git; `chmod 600`

### Файлы и наблюдаемость

- [ ] **Uploads volume / S3 strategy**: prod — volume `frontend_uploads` → `/app/uploads`; для multi-node — план `STORAGE_DRIVER=s3` ([UPLOADS_VOLUME.md](./migrations/UPLOADS_VOLUME.md))
- [ ] **Logs monitored**: `docker compose logs`, ротация json-file; алерт на 5xx и disk >80%
- [ ] Uptime на `/api/health` и `/nginx-health`
- [ ] `AUTH_URL` / `NEXT_PUBLIC_APP_URL` = фактический HTTPS origin

### Финальный smoke

```bash
cd cyberedu
CHECK_REDIS=1 BASE_URL=https://your-domain ./scripts/staging-smoke.sh
```

Полный чеклист: [checklists/FINAL_CHECKLIST.md](./checklists/FINAL_CHECKLIST.md) · [checklists/DEPLOYMENT_CHECKLIST.md](./checklists/DEPLOYMENT_CHECKLIST.md).

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

## UX screenshots (placeholder)

Реальные скриншоты в репозиторий **не включены** — не используйте фейковые изображения.

### Куда класть файлы

Каталог: [`screenshots/`](./screenshots/). Формат: PNG или WebP, ширина 1280–1920 px, **без PII** и секретов.

### Какие экраны снять

| Файл (пример) | Экран | Что должно быть видно |
|---------------|--------|------------------------|
| `01-landing.png` | **Landing / home** | Hero, CTA «Начать», навигация |
| `02-dashboard.png` | **Student dashboard** | Приветствие, «Продолжить обучение», прогресс, ближайшие задания |
| `03-course.png` | **Course map** | Траектория модулей, % курса, CTA к текущему модулю |
| `04-lesson.png` | **Lesson** | Контент лекции, sidebar/steps, прогресс модуля |
| `05-test.png` | **Test** | Вопрос, progress bar, навигация по вопросам |
| `06-practice.png` | *(опционально)* | Практика / SOC lab |
| `07-admin.png` | **Admin dashboard** | KPI, быстрые действия, статус системы |

### Вставка в README после съёмки

```markdown
![Student dashboard](./cyberedu/docs/screenshots/02-dashboard.png)
```

Инструкция для авторов: [screenshots/README.md](./screenshots/README.md).

---

## Быстрые команды (шпаргалка)

```bash
# Проверки frontend (перед PR)
cd cyberedu/frontend && npm run lint && npm run typecheck

# Unit tests
cd cyberedu/frontend && npm test

# E2E smoke (app на :3100, seed dev)
cd cyberedu/frontend && npm run test:e2e

# Production rate-limit guard
cd cyberedu/frontend && npm run check:rate-limit
```
