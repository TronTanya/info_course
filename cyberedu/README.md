# CyberEdu — операционное руководство

| Аудитория | Документ |
|-----------|----------|
| **Portfolio / GitHub** | **[`../README.md`](../README.md)** (EN) · **[`../README.ru.md`](../README.ru.md)** (RU) |
| **Защита / обзор (RU)** | Тот же корневой README + [`docs/DEFENSE_READINESS.md`](./docs/DEFENSE_READINESS.md) |
| **Эксплуатация** | Этот файл + [`docs/OPERATIONS.md`](./docs/OPERATIONS.md) |

## Быстрый старт (development)

```bash
cp .env.example .env
docker compose up --build
```

Демо-данные курса (только изолированная dev-среда):

```bash
RUN_SEED=1 docker compose up --build
```

| URL | Сервис |
|-----|--------|
| http://localhost:3100 | Next.js |
| http://localhost:18000/docs | FastAPI OpenAPI |
| http://127.0.0.1:15050 | pgAdmin |

### Учётные записи после seed

Создаются **только** при `RUN_SEED=1`. Email:

- `admin@cyberedu.local` — администратор  
- `student@cyberedu.local` — студент  

Пароли **не документируются в git**. Настройте локально (см. комментарии в [`frontend/.env.example`](./frontend/.env.example)) или смените пароль после первого входа. **Не используйте** эти учётки в production.

## Production

```bash
cp .env.prod.example .env.production
chmod 600 .env.production
# отредактируйте CHANGE_ME_* и your-domain.example
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

### Проверка compose локально (без warnings)

Без `--env-file` Compose выдаёт ошибки о незаданных секретах (`${VAR:?…}`) — это ожидаемо.

```bash
make compose-prod-config-quiet
# или:
./scripts/compose-prod-config.sh --quiet
# или:
docker compose --env-file .env.prod.example -f docker-compose.prod.yml config
```

Шаблон переменных: [`.env.prod.example`](./.env.prod.example) (в git). На VPS копируйте в `.env.production` (не коммитить).

`RUN_SEED=0` · `ENVIRONMENT=production` · см. [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)

### Production-like окружение (новый разработчик)

1. Dev stack: `docker compose up -d postgres redis` (из каталога `cyberedu/`).
2. `cd frontend && cp .env.example .env` — задайте `DATABASE_URL`, `REDIS_URL=redis://127.0.0.1:6379/0`.
3. Для проверки prod-поведения rate limit: `ENVIRONMENT=production npm run dev` (только на локальной БД).
4. Prod E2E (app уже на :3100 с `ENVIRONMENT=production` + `REDIS_URL`):
   `npm run smoke:prod-e2e` или `SMOKE_MODE=prod-e2e ../scripts/staging-smoke.sh`
5. Полный цикл (migrate, seed, build, start, e2e): `npm run smoke:staging:local`.

Чеклисты и troubleshooting: **[`docs/OPERATIONS.md`](./docs/OPERATIONS.md)** · go-live: **[`docs/GO_LIVE_CHECKLIST.md`](./docs/GO_LIVE_CHECKLIST.md)** · индекс: **[`docs/README.md`](./docs/README.md)**.

## Пересборка frontend после правок кода

```bash
docker compose build frontend
docker compose up -d --force-recreate frontend
# или: ./scripts/rebuild-frontend.sh
```

Hot reload без пересборки образа: `./scripts/design-live.sh` (останавливает контейнер `frontend`, запускает `npm run dev` на :3100).

## Тесты

```bash
cd frontend
npm run lint
npm run typecheck
npm run test                  # Vitest (unit + security)
npm run test:security         # только security/rate-limit тесты
npm run test:e2e              # Playwright dev smoke (app :3100 + seed)
npm run test:e2e:prod         # production-like specs (REDIS_URL + ENVIRONMENT=production)
npm run smoke:staging:local   # migrate, build, start, prod e2e (скрипт)
```

Карта security-тестов: [`docs/SECURITY.md`](./docs/SECURITY.md#автоматические-тесты-vitest).

## Документация (минимальный набор)

| Файл | Тема |
|------|------|
| [`README.md`](./README.md) | Этот файл — quick start dev/prod |
| [`../README.md`](../README.md) | Обзор для защиты (корень репозитория) |
| [`.env.prod.example`](./.env.prod.example) | Шаблон production env |
| [`docs/README.md`](./docs/README.md) | **Индекс** + путеводитель по задачам |
| [`docs/OPERATIONS.md`](./docs/OPERATIONS.md) | Production, backup, admin, staging smoke, тесты |
| [`docs/GO_LIVE_CHECKLIST.md`](./docs/GO_LIVE_CHECKLIST.md) | Go-live checklist |
| [`docs/SECURITY.md`](./docs/SECURITY.md) | Безопасность + Vitest |
| [`docs/STORAGE.md`](./docs/STORAGE.md) | Uploads: local only, S3 NOT IMPLEMENTED |
| [`docs/screenshots/`](./docs/screenshots/) | UX-скриншоты |

Дополнительно: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) · [`docs/DATABASE.md`](./docs/DATABASE.md) · [`docs/SUPABASE.md`](./docs/SUPABASE.md) · [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) · [`docs/checklists/`](./docs/checklists/)

## Скриншоты для защиты

Каталог: [`docs/screenshots/`](./docs/screenshots/) — PNG для README (генерация: `cd frontend && npm run screenshots`). См. [`docs/screenshots/README.md`](./docs/screenshots/README.md).

Upload storage (local volume / S3 roadmap): [`docs/STORAGE.md`](./docs/STORAGE.md).
