# Go-live checklist

Отмечайте `[x]` на **staging**, максимально близком к production (`ENVIRONMENT=production`, Redis, TLS, те же compose-файлы).

Связанные документы: [OPERATIONS.md](./OPERATIONS.md) (production setup) · [DEPLOYMENT.md](./DEPLOYMENT.md) · [checklists/FINAL_CHECKLIST.md](./checklists/FINAL_CHECKLIST.md) · [STORAGE.md](./STORAGE.md)

---

## Required checks

- [ ] **CI green** на `main` ([`.github/workflows/ci.yml`](../../.github/workflows/ci.yml))
- [ ] `cd cyberedu/frontend && npm run lint`
- [ ] `cd cyberedu/frontend && npm run typecheck`
- [ ] `cd cyberedu/frontend && npm test`
- [ ] `cd cyberedu/frontend && npm run test:e2e` (dev smoke; app на `:3100` + seed)
- [ ] `cd cyberedu/frontend && npm run test:e2e:prod` (alias staging: prod specs + **real Redis**)
- [ ] `cd cyberedu/frontend && npm run test:e2e:staging` или `npm run smoke:staging:local` (то же для CI/локального smoke)
- [ ] Compose config без warnings:
  ```bash
  docker compose --env-file cyberedu/.env.prod.example \
    -f cyberedu/docker-compose.prod.yml config --quiet
  ```
  (или `make -C cyberedu compose-prod-config-quiet`)
- [ ] **Redis smoke passed**: `redis-ping: PONG` в CI / `npm run redis:ping`; `/api/health` → `checks.redis: "ok"`
- [ ] **PostgreSQL migrations applied**: `frontend-migrate` exit 0; `prisma migrate deploy` на staging DB
- [ ] **Admin account created securely** (не seed): отдельный email, сильный пароль, роль `ADMIN`

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

---

## Operations

- [ ] **Backups configured** — Postgres `pg_dump` + volume `frontend_uploads` ([OPERATIONS.md § Backup notes](./OPERATIONS.md#backup-notes))
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
| CSP | По умолчанию report-only в prod; переход на enforce — отдельный шаг |

См. также [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md) · [OPERATIONS.md § Troubleshooting](./OPERATIONS.md#troubleshooting).
