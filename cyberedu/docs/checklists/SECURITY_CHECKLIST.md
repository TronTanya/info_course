# SECURITY CHECKLIST

Периодичность: **каждый релиз** + **ежеквартальный** полный проход.

## Аутентификация и сессии

- [ ] `AUTH_SECRET` / `NEXTAUTH_SECRET` ротация по политике (при компрометации — немедленно)
- [ ] Secure cookies в production (`__Secure-`, `httpOnly`, `sameSite`)
- [ ] Session max age (`AUTH_SESSION_MAX_AGE`) соответствует политике
- [ ] Login lockout / rate limit на credentials callback
- [ ] Пароли: bcrypt, минимальная сложность на регистрации
- [ ] Нет `passwordHash` в API responses и admin UI

## Авторизация (RBAC)

- [ ] `/admin/*` — только `ADMIN` (middleware + server actions)
- [ ] `/dashboard/*` — только authenticated `USER`/`ADMIN`
- [ ] Server Actions проверяют ownership (submissions, profile, certificates)
- [ ] CSV export — `withApiGuard` + permission admin
- [ ] Practice file download — owner or admin only

## API и CSRF

- [ ] Mutating `/api/*` — CSRF (origin + cookie), кроме `/api/auth/*`
- [ ] Backend internal routes — `X-API-Key: INTERNAL_API_KEY` (**C1:** без ключа → 401, dev и prod)
- [ ] `GET /api/v1/course-progress` без ключа возвращает 401 (не раскрывает ПДн)
- [ ] Production: `INTERNAL_API_KEY` задан; sensitive routes fail-closed
- [ ] OpenAPI `/docs` disabled in production
- [ ] CORS whitelist не содержит `*`

## Input и файлы

- [ ] Zod validation на AI и practice routes
- [ ] Upload: size cap, extension allowlist, magic bytes
- [ ] Path traversal в upload sandbox заблокирован
- [ ] SSRF guards в sanitize (metadata hosts)
- [ ] Certificate verify rate limited

## AI

- [ ] Pre/post moderation в tutor pipeline
- [ ] Rate limits: per IP + per user на chat/adapt
- [ ] Нет `isCorrect` / эталонов практики в промпте
- [ ] Audit log для отказов / rate limit (при `SECURITY_AUDIT_DB=1`)

## Headers и transport

- [ ] CSP, HSTS (после SSL), X-Frame-Options, Referrer-Policy
- [ ] TLS 1.2+ на Nginx; certbot renewal
- [ ] Secrets только в env / secret manager, не в images

## Infrastructure

- [ ] Postgres/Redis/backend не на `0.0.0.0` в production (**C2**)
- [ ] Dev: порты compose привязаны к `127.0.0.1` (если используется dev compose на сервере)
- [ ] `RUN_SEED=0` в production (**C3**)
- [ ] Seed только при явном `RUN_SEED=1` в dev
- [ ] pgAdmin не в production stack
- [ ] Docker images run as non-root (frontend `nextjs`, backend `app`)
- [ ] Dependabot / `npm audit` / обновление base images

## Logging и privacy

- [ ] Audit log не пишет пароли и полные токены
- [ ] PII в course-progress export — только для authorized admin
- [ ] Retention policy для logs и uploads (определить)

## Incident response

- [ ] Контакты on-call задокументированы
- [ ] Процедура ротации секретов описан
- [ ] Backup restore протестирован на копии

## Known gaps (track)

| Gap | Severity | Mitigation |
|-----|----------|------------|
| In-memory rate limit без Redis на всех paths | Medium | `REDIS_URL` в prod + code audit |
| Не все Route Handlers на `withApiGuard` | Medium | Постепенная миграция |
| Dual DB schema (Prisma + Alembic) | Medium | Single source of truth plan |
| No WAF | Low | Cloudflare / Nginx modsecurity optional |
