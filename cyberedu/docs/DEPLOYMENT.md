# DEPLOYMENT — CyberEdu

Операционное руководство для production (VPS). Краткий чеклист: [checklists/DEPLOYMENT_CHECKLIST.md](./checklists/DEPLOYMENT_CHECKLIST.md).

> Дублирует и расширяет [`../deploy/DEPLOYMENT.md`](../deploy/DEPLOYMENT.md) (nginx paths, certbot). Этот файл — **canonical** для CTO/on-call.

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
cp .env.production.example .env.production
chmod 600 .env.production
```

Обязательные переменные — см. `.env.production.example`. Генерация:

```bash
openssl rand -base64 32   # AUTH_SECRET, JWT_SECRET_KEY
openssl rand -hex 32      # INTERNAL_API_KEY
```

## First deploy

```bash
docker compose -f docker-compose.prod.yml \
  --env-file .env.production up -d --build
```

Verify:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production ps
curl -fsS http://127.0.0.1/nginx-health
curl -fsS http://127.0.0.1/api/health
```

Script: `deploy/scripts/vps-deploy.sh`

## SSL (Let's Encrypt)

1. DNS → VPS IP
2. HTTP on port 80 for ACME webroot
3. Certbot → `deploy/nginx/certs/`
4. Enable `deploy/nginx/conf.d/cyberedu.ssl.conf` (from `.ssl.conf.example`)
5. `docker compose ... restart nginx`

## CI/CD

| Workflow | Trigger | Output |
|----------|---------|--------|
| `ci.yml` | PR / push `main` | lint, test, docker build smoke |
| `release.yml` | tag `v*.*.*` | GHCR images |

Deploy from GHCR: set image tags in compose override or pull by digest.

## Migrations

- **Production:** `frontend-migrate` runs `prisma migrate deploy` before app start
- **Never** run `prisma db seed` on prod (`RUN_SEED=0`). Seed отклоняет `NODE_ENV=production` и не перезаписывает `passwordHash` существующих пользователей.
- **Alembic:** `docker compose exec backend alembic upgrade head` when backend schema changes

## Backups

```bash
# Example daily backup (cron on host)
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > /backups/cyberedu-$(date +%F).sql.gz
```

Retention: 7 daily, 4 weekly — adjust per policy. **Test restore** quarterly.

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
| Redis | profile `cache` | required (internal) |
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

1. Note current image digest/tag
2. `docker compose up -d` with previous tags
3. If DB migration broke: restore from backup, redeploy previous app version
