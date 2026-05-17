# CyberEdu — операционное руководство

Полное описание проекта, цели, архитектура, безопасность и раздел для защиты: **[`../README.md`](../README.md)** (корень репозитория).

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
4. Полный prod-like E2E: `npm run test:e2e:prod:local`.

Чеклисты и troubleshooting: **[`docs/OPERATIONS.md`](./docs/OPERATIONS.md)**.

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
npm run test              # Vitest
npm run test:e2e          # Playwright (нужен running app + seed)
```

## Документация

| Файл | Тема |
|------|------|
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | Архитектура |
| [`docs/SECURITY.md`](./docs/SECURITY.md) | Безопасность |
| [`docs/DATABASE.md`](./docs/DATABASE.md) | Prisma / миграции |
| [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) | Деплой |
| [`docs/OPERATIONS.md`](./docs/OPERATIONS.md) | Production / go-live / troubleshooting |
| [`docs/checklists/`](./docs/checklists/) | Чеклисты |

## Скриншоты для защиты

Каталог: [`docs/screenshots/`](./docs/screenshots/) — PNG для README (генерация: `cd frontend && npm run screenshots`). См. [`docs/screenshots/README.md`](./docs/screenshots/README.md).

Upload storage (local volume / S3 roadmap): [`docs/STORAGE.md`](./docs/STORAGE.md).
