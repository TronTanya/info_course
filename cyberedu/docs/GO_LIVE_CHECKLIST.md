# Go-live checklist

Отмечайте `[x]` на **staging**, максимально близком к production (`ENVIRONMENT=production`, Redis, TLS, те же compose-файлы).

Связанные документы: [PRODUCTION_AUDIT_2026-05.md](./PRODUCTION_AUDIT_2026-05.md) (полный audit) · [DEFENSE_READINESS.md](./DEFENSE_READINESS.md) (**защита / пилот — команды + ручной UI**) · [OPERATIONS.md](./OPERATIONS.md) · [DEPLOYMENT.md](./DEPLOYMENT.md) · [checklists/FINAL_CHECKLIST.md](./checklists/FINAL_CHECKLIST.md) · [STORAGE.md](./STORAGE.md)

---

## Required checks

- [ ] **CI green** на `main` ([`.github/workflows/ci.yml`](../../.github/workflows/ci.yml))
- [ ] **TLS gate passed:** `deploy/nginx/conf.d/cyberedu.ssl.conf` существует, без `YOUR_DOMAIN`; `./deploy/scripts/vps-deploy.sh` не требует `ALLOW_HTTP_BOOTSTRAP=1`
- [ ] `cd cyberedu/frontend && npm ci`
- [ ] `cd cyberedu/frontend && npm run lint`
- [ ] `cd cyberedu/frontend && npm run typecheck`
- [ ] `cd cyberedu/frontend && npm test`
- [ ] `cd cyberedu/frontend && npx prisma validate`
- [ ] `cd cyberedu/frontend && npm run test:e2e` (dev smoke; app на `:3100` + seed)
- [ ] `cd cyberedu/frontend && npm run test:e2e:prod:local` **или** prod specs при сервере с `ENVIRONMENT=production` ([DEFENSE_READINESS.md § фаза 3](./DEFENSE_READINESS.md#фаза-3--production-like-e2e))
- [ ] `cd cyberedu/frontend && npm run test:e2e:staging` или `npm run smoke:staging:local` (то же для CI/локального smoke)
- [ ] Compose config без warnings:
  ```bash
  docker compose --env-file cyberedu/.env.prod.example \
    -f cyberedu/docker-compose.prod.yml config --quiet
  ```
  (или `make -C cyberedu compose-prod-config-quiet`)
- [ ] **Redis smoke passed**: `redis-ping: PONG` в CI / `npm run redis:ping`; `/api/health` → `checks.redis: "ok"`
- [ ] **PostgreSQL migrations applied**: `frontend-migrate` exit 0; `prisma migrate deploy` на staging DB
- [ ] **Admin account created securely** (не seed): регистрация → `role = ADMIN` в БД — [OPERATIONS.md § Создание администратора](./OPERATIONS.md#создание-администратора-production)

---

## Security

Покрытие тестами (локально или в CI):

- [ ] **CSRF negative tests** — `tests/security-csrf.test.ts`, mutating `/api/*` без cookie/origin → 403
- [ ] **RBAC negative tests** — `tests/security-rbac.test.ts`, `/admin` без роли → redirect/403
- [ ] **Upload validation tests** — `tests/security-upload.test.ts`, `tests/practice-files.test.ts`
- [ ] **Rate limit tests** — `tests/rate-limit*.test.ts`, job `rate-limit-redis` в CI
- [ ] **Certificate verification tests** — `tests/security-certificate-verify.test.ts`
- [ ] **AI safety tests** — `tests/security-ai-tutor.test.ts` (+ ручной smoke без выдачи ответов теста)

Операционно на staging:

- [ ] `RUN_SEED=0`, демо-учётки `*.local` отсутствуют или отключены
- [ ] Секреты уникальны (не из `.env.example`): `AUTH_SECRET`, `JWT_SECRET_KEY`, `INTERNAL_API_KEY`, `POSTGRES_PASSWORD`, `REDIS_PASSWORD`
- [ ] `.env.production` не в git; `chmod 600`
- [ ] HTTP redirect на HTTPS включён (`curl -I http://<domain>` → `301` на `https://...`)

---

## Operations

- [ ] **Backups configured** — `./scripts/backup-production.sh` + cron ([`deploy/cron/cyberedu-backup.cron.example`](../deploy/cron/cyberedu-backup.cron.example))
- [ ] **Restore drill** — `BACKUP_SQL_GZ=.../latest/postgres.sql.gz ./scripts/restore-drill.sh` (квартал)
- [ ] **Uptime monitor** — cron `BASE_URL=... CHECK_NGINX=1 ./scripts/monitor-health.sh` или внешний ping `/api/health`
- [ ] **Logs monitored** — `docker compose logs`, ротация json-file; алерт на 5xx / disk
- [ ] **Healthchecks enabled** — `docker compose ps` → `healthy` (postgres, redis, frontend, backend, nginx)
- [ ] **Secrets rotated** от dev/staging
- [ ] **Upload storage strategy confirmed**: `UPLOAD_STORAGE_DRIVER=local` + persistent volume — **single replica only**; `s3` **не реализован** ([STORAGE.md](./STORAGE.md))

### Финальный HTTP smoke

```bash
cd cyberedu
CHECK_REDIS=1 BASE_URL=https://your-staging-domain ./scripts/staging-smoke.sh
```

---

## Остаточные риски (честно)

| Риск | Статус |
|------|--------|
| Uploads на local volume | OK для **одной** реплики frontend; multi-node → нужен S3 ([STORAGE.md](./STORAGE.md)) |
| `UPLOAD_STORAGE_DRIVER=s3` | Зарезервировано, **NOT IMPLEMENTED** |
| JWT sessions без shared store | Несколько реплик Next → sticky sessions или доработка |
| AI | Зависит от внешнего API; без ключа — graceful degradation |
| CSP | По умолчанию **enforce** в prod; откат: `CSP_MODE=report-only` |

См. также [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md) · [OPERATIONS.md § Troubleshooting](./OPERATIONS.md#troubleshooting).
