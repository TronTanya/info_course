# CyberEdu documentation

Индекс документации репозитория `info_course` (приложение в [`../`](../)).

## Operations & deploy

| Документ | Содержание |
|----------|------------|
| [OPERATIONS.md](./OPERATIONS.md) | **Canonical**: production checklist, env, PostgreSQL, Redis, migrations, seed, e2e, troubleshooting, screenshots |
| [GO_LIVE_CHECKLIST.md](./GO_LIVE_CHECKLIST.md) | Чеклист перед выкладкой (CI, security tests, ops) |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | VPS, Nginx, SSL, compose prod |
| [STORAGE.md](./STORAGE.md) | Uploads: local volume, single-replica risk, S3 roadmap |
| [migrations/UPLOADS_VOLUME.md](./migrations/UPLOADS_VOLUME.md) | Persistent volume `frontend_uploads` |

## Architecture & API

| Документ | Содержание |
|----------|------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Компоненты, потоки данных |
| [DATABASE.md](./DATABASE.md) | Prisma, Alembic, миграции |
| [API.md](./API.md) | HTTP API |
| [SECURITY.md](./SECURITY.md) | Модель безопасности |

## Checklists

| Документ | Содержание |
|----------|------------|
| [checklists/FINAL_CHECKLIST.md](./checklists/FINAL_CHECKLIST.md) | Полный pre-production |
| [checklists/DEPLOYMENT_CHECKLIST.md](./checklists/DEPLOYMENT_CHECKLIST.md) | Краткий деплой |
| [checklists/SECURITY_CHECKLIST.md](./checklists/SECURITY_CHECKLIST.md) | Безопасность |
| [checklists/RELEASE_CHECKLIST.md](./checklists/RELEASE_CHECKLIST.md) | Релиз по тегу |

## UX

| Документ | Содержание |
|----------|------------|
| [screenshots/](./screenshots/) | PNG для README (`npm run screenshots` в frontend) |
| [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md) | Оценка готовности и P0/P1 |

Корневой обзор для защиты проекта: [`../../README.md`](../../README.md).
