# CyberEdu documentation

Documentation index for the `info_course` repository (application in [`../`](../)).

## Start here

| Audience | Document |
|----------|----------|
| **GitHub / portfolio visitors** | [`../../README.md`](../../README.md) (EN) · [`../../README.ru.md`](../../README.ru.md) (RU) |
| **Developers (RU quick start)** | [`../README.md`](../README.md) — Docker dev/prod, tests |
| **Go-live / ops** | [OPERATIONS.md](./OPERATIONS.md) · [GO_LIVE_CHECKLIST.md](./GO_LIVE_CHECKLIST.md) |

## Минимальный набор (обязательный)

| Документ | Зачем читать |
|----------|----------------|
| [`../../README.md`](../../README.md) | Portfolio README: features, architecture, screenshots |
| [`../README.md`](../README.md) | Quick start dev/prod, тесты |
| [OPERATIONS.md](./OPERATIONS.md) | **Canonical ops**: env, PostgreSQL, Redis, migrations, **создание admin**, backup, staging smoke, тесты |
| [DEFENSE_READINESS.md](./DEFENSE_READINESS.md) | **Защита / пилот**: автоматические команды + ручной UI |
| [GO_LIVE_CHECKLIST.md](./GO_LIVE_CHECKLIST.md) | Чеклист перед выкладкой (CI, security tests, ops) |
| [THREAT_MODEL.md](./THREAT_MODEL.md) | **Threat model**: активы, границы доверия, угрозы, gaps |
| [SECURITY.md](./SECURITY.md) | Реализация контролей + **карта Vitest-тестов** |
| [SECURITY_PLATFORM.md](./SECURITY_PLATFORM.md) | Безопасность как **преимущество платформы** (витрина для защиты/портфолио) |
| [STORAGE.md](./STORAGE.md) | Local uploads, **single replica**, S3 **NOT IMPLEMENTED** |
| [CERTIFICATE.md](./CERTIFICATE.md) | PDF-сертификат, шаблон, скачивание |
| [screenshots/](./screenshots/) | PNG для README (`npm run screenshots`) |
| [`../.env.prod.example`](../.env.prod.example) | Шаблон production env (не коммитить `.env.production`) |

### Быстрый путеводитель

| Задача | Куда смотреть |
|--------|----------------|
| Запуск **локально** (dev) | [../README.md § Быстрый старт](../README.md) · `docker compose up` + `RUN_SEED=1` |
| Запуск **production-like** | [OPERATIONS.md](./OPERATIONS.md) · [../README.md § Production-like](../README.md) |
| Какие **env vars** нужны | [OPERATIONS.md § Required environment variables](./OPERATIONS.md#required-environment-variables) · [`.env.prod.example`](../.env.prod.example) · [`frontend/.env.example`](../frontend/.env.example) |
| **Создать admin** | [OPERATIONS.md § Создание администратора](./OPERATIONS.md#создание-администратора-production) |
| **Чеклист защиты / пилота** | [DEFENSE_READINESS.md](./DEFENSE_READINESS.md) |
| Прогнать **unit-тесты** | `cd frontend && npm test` · карта в [SECURITY.md](./SECURITY.md#автоматические-тесты-vitest) |
| **Staging smoke** | [OPERATIONS.md](./OPERATIONS.md) · `CHECK_REDIS=1 ./scripts/staging-smoke.sh` |
| **Backup** | [OPERATIONS.md § Backup notes](./OPERATIONS.md#backup-notes) |
| **Ограничения** (S3, replicas, AI) | [STORAGE.md](./STORAGE.md) · [GO_LIVE_CHECKLIST § Остаточные риски](./GO_LIVE_CHECKLIST.md#остаточные-риски-честно) · [../README.md § Known limitations](../../README.md#13-known-limitations) |

---

## Operations & deploy

| Документ | Содержание |
|----------|------------|
| [OPERATIONS.md](./OPERATIONS.md) | Production checklist, env, PostgreSQL, Redis, migrations, seed, e2e, troubleshooting, screenshots |
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
| [screenshots/README.md](./screenshots/README.md) | Генерация и имена файлов |
| [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md) | Оценка готовности и P0/P1 |

Portfolio overview: [`../../README.md`](../../README.md) · Защита: [DEFENSE_READINESS.md](./DEFENSE_READINESS.md).
