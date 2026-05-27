# DEPLOYMENT — CyberEdu

Операционное руководство для production (VPS).

| Документ | Содержание |
|----------|------------|
| **[OPERATIONS.md](./OPERATIONS.md)** | Production checklist, env, troubleshooting, UX screenshots |
| **[GO_LIVE_CHECKLIST.md](./GO_LIVE_CHECKLIST.md)** | Go-live: CI, security tests, ops |
| [checklists/DEPLOYMENT_CHECKLIST.md](./checklists/DEPLOYMENT_CHECKLIST.md) | Краткий чеклист деплоя |
| [checklists/FINAL_CHECKLIST.md](./checklists/FINAL_CHECKLIST.md) | Полный pre-production |

> Дублирует и расширяет [`../deploy/DEPLOYMENT.md`](../deploy/DEPLOYMENT.md) (nginx paths, certbot). Этот файл — **canonical** для инфраструктуры; операционные чеклисты — в **OPERATIONS.md**.

## Topology

```
Internet → Nginx (:80/:443)
              ├─ /           → frontend:3000 (Next.js standalone)
              └─ /api/v1/    → backend:8000 (FastAPI)
           postgres, redis     (Docker network: internal only)
```

| Service | Image build | Role |
|---------|-------------|------|
| `postgres` | `postgres:16-alpine` | Primary database |
| `redis` | `redis:7-alpine` | Rate limit / cache |
| `backend` | `backend/Dockerfile` | Internal API |
| `frontend-migrate` | `frontend/Dockerfile` target `migrate` | Prisma migrate deploy (one-shot) |
| `frontend` | `frontend/Dockerfile` target `runner` | Web app |
| `nginx` | `nginx:1.27-alpine` | Reverse proxy |
| `prometheus` | profile `monitoring` | Metrics (optional) |

## Requirements

| Resource | Minimum |
|----------|---------|
| CPU | 2 vCPU |
| RAM | 4 GB |
| Disk | 40 GB SSD |
| OS | Linux + Docker 24+ Compose v2 |

## Environment files (runtime only)

Секреты **не передаются** в `docker build` (`DATABASE_URL`, `AUTH_SECRET`, `OPENAI_API_KEY` — только в контейнере при `up`).

- **`--env-file .env.production`** — подстановка `${VAR}` в compose YAML
- **`env_file: .env.production`** на сервисах — переменные внутри контейнера

```bash
cd cyberedu
cp .env.prod.example .env.production
chmod 600 .env.production
```

Обязательные переменные — см. `.env.prod.example`. Локальная проверка compose:

```bash
make -C cyberedu compose-prod-config-quiet
```

Генерация секретов:

```bash
openssl rand -base64 32   # AUTH_SECRET, JWT_SECRET_KEY
openssl rand -hex 32      # INTERNAL_API_KEY
```

## First deploy

```bash
docker compose -f docker-compose.prod.yml \
  --env-file .env.production up -d --build
```

Рекомендуемый путь (c guard от HTTP-only релиза):

```bash
./deploy/scripts/vps-deploy.sh
```

Скрипт по умолчанию требует `deploy/nginx/conf.d/cyberedu.ssl.conf` без placeholder `YOUR_DOMAIN`.
Одноразовый bootstrap без TLS (только для выпуска certbot) — явно:

```bash
ALLOW_HTTP_BOOTSTRAP=1 ./deploy/scripts/vps-deploy.sh
```

Verify:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production ps
curl -fsS http://127.0.0.1/nginx-health
curl -fsS http://127.0.0.1/api/health
```

Script: `deploy/scripts/vps-deploy.sh` (перед `up` вызывает `./scripts/validate-prod-env.sh` — слабые секреты, `RUN_SEED`, placeholders).

Локально проверить env без деплоя:

```bash
make -C cyberedu validate-prod-env ENV_FILE=.env.production
```

Post-deploy smoke (с Redis на production):

```bash
BASE_URL=https://your-domain CHECK_REDIS=1 ./scripts/staging-smoke.sh
# Полный submit-flow (тест + практика): RUN_E2E=1 BASE_URL=... ./scripts/staging-smoke.sh
```

Production-like E2E в CI / локально (PostgreSQL + Redis + `ENVIRONMENT=production`, без mock Redis):

```bash
cd cyberedu/frontend
npm run test:e2e:prod          # приложение уже запущено с REDIS_URL + ENVIRONMENT=production
npm run test:e2e:prod:local    # migrate, seed (E2E_PRODUCTION_SMOKE), build, start, playwright
```

## SSL (Let's Encrypt)

1. DNS → VPS IP
2. HTTP on port 80 for ACME webroot
3. Certbot → `deploy/nginx/certs/`
4. Enable `deploy/nginx/conf.d/cyberedu.ssl.conf` (from `.ssl.conf.example`)
5. `docker compose ... restart nginx`
6. Убедиться, что `deploy/nginx/conf.d/cyberedu.conf` редиректит `http://` → `https://`

## CI/CD

| Workflow | Trigger | Output |
|----------|---------|--------|
| `ci.yml` | PR / push `main` | lint, test, docker build smoke |
| `release.yml` | tag `v*.*.*` | GHCR images |

Deploy from GHCR:

```bash
# .env.production: GHCR_OWNER=your-org CYBEREDU_IMAGE_TAG=v1.2.3
DEPLOY_FROM_GHCR=1 ./deploy/scripts/vps-deploy.sh
```

Uses `docker-compose.prod.ghcr.yml` + `--no-build`. Digests: `.deploy/last-images.txt`.

## Migrations

- **Production:** `frontend-migrate` runs `prisma migrate deploy` before app start (единственный источник DDL)
- **Never** run `prisma db seed` on prod (`RUN_SEED=0`, `docker-entrypoint.prod.sh`). Seed отклоняет `ENVIRONMENT=production` и не перезаписывает `passwordHash` существующих пользователей.
- **Alembic:** опционально `alembic upgrade head` (no-op ревизии); схему не меняет — см. [DATABASE.md](./DATABASE.md)
- **Schema contract:** `cd backend && DATABASE_URL=... pytest tests/test_db_schema_contract.py`

## Backups

```bash
cd cyberedu
BACKUP_DIR=/var/backups/cyberedu ./scripts/backup-production.sh
# restore drill (quarterly):
BACKUP_SQL_GZ=/var/backups/cyberedu/latest/postgres.sql.gz ./scripts/restore-drill.sh
```

Cron: `deploy/cron/cyberedu-backup.cron.example`. Retention: `RETENTION_DAYS` (default 14). **Test restore** quarterly via `restore-drill.sh`.

## Logs

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f frontend backend nginx
```

Docker logging driver: `json-file`, `max-size: 20m`, `max-file: 5`.

## Monitoring

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production --profile monitoring up -d
# Prometheus: 127.0.0.1:9090 (SSH tunnel only)
```

External uptime: monitor `https://<domain>/api/health` and `/nginx-health`.

## Dev vs Prod

| | Development | Production |
|---|-------------|------------|
| Compose | `docker-compose.yml` | `docker-compose.prod.yml` |
| Env | `.env` | `.env.production` + `env_file` |
| DB / Redis ports | `127.0.0.1` (dev) | internal only |
| pgAdmin | yes | no |
| Seed | only `RUN_SEED=1` | `RUN_SEED=0` |
| Nginx | no | yes |
| Redis | yes (`127.0.0.1:6379`) | required (internal) |
| Secrets in build | no | no |

## Troubleshooting

| Symptom | Action |
|---------|--------|
| 502 Bad Gateway | Wait for healthchecks; `docker compose ps` |
| Auth loops | `AUTH_URL` must match browser URL |
| AI errors | Check `OPENAI_API_KEY` |
| Migrate failed | `logs frontend-migrate`; do not start app until fixed |
| Disk full | Prune images; check uploads volume |

## Rollback

1. GHCR: `./scripts/rollback-production.sh` (uses `.deploy/previous-release.env` from last `vps-deploy.sh`)
2. Build on server: set `CYBEREDU_IMAGE_TAG` / rebuild previous git commit, then `vps-deploy.sh`
3. If DB migration broke: restore from backup (`restore-drill.sh` validates dumps), redeploy previous app version

## Monitoring (cron / uptime)

```bash
BASE_URL=https://your-domain CHECK_NGINX=1 ./scripts/monitor-health.sh
```

Exit code `1` when `/api/health` is not `ok` or Redis is `error` in production.
