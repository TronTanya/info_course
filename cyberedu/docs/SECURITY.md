# SECURITY — CyberEdu

Документ описывает модель безопасности для production deployment. Операционный чеклист: [checklists/SECURITY_CHECKLIST.md](./checklists/SECURITY_CHECKLIST.md).

## Trust boundaries

```text
[Internet] → [Nginx TLS] → [Next.js | FastAPI] → [PostgreSQL | Redis]
                ↑                    ↑
           Public HTTP          Trusted internal network (compose)
```

- **Untrusted:** браузер пользователя, внешние AI API
- **Semi-trusted:** Nginx (terminates TLS, forwards headers)
- **Trusted:** application containers, DB on internal Docker network

## Аутентификация

| Механизм | Детали |
|----------|--------|
| Студент/админ | Email + password → NextAuth JWT session |
| Backend internal | Header `X-API-Key: <INTERNAL_API_KEY>` |
| Session | `AUTH_SECRET`; production cookies hardened |

**Не хранится:** plaintext passwords (только `passwordHash` bcrypt).

## Авторизация

Роли в JWT: `USER`, `ADMIN`.

| Ресурс | USER | ADMIN |
|--------|------|-------|
| Own profile / progress | ✓ | ✓ |
| Other users PII | ✗ | ✓ (admin UI) |
| Course content edit | ✗ | ✓ |
| Grade submissions | ✗ | ✓ |
| CSV export | ✗ | ✓ |

Реализация: `middleware.ts`, `requireAuth` / `requireAdmin`, `lib/security/rbac.ts`, `withApiGuard`.

## Защита API (Next.js)

### CSRF

Для `POST`/`PUT`/`PATCH`/`DELETE` на `/api/*` (кроме `/api/auth/*`):

- Проверка `Origin` / `Referer`
- Double-submit cookie pattern (`lib/security/csrf.ts`)

### Rate limiting

| Зона | Пример лимита |
|------|----------------|
| Login callback | 20 / 15 min / IP |
| AI POST | 120 / hour / IP (+ per-user in routes) |
| Certificate verify | 40 / 15 min / IP |
| Admin API | 60 / hour / IP |

Реализация: `lib/security/rate-limit.ts` (memory; Redis if `REDIS_URL`).

### API guard (целевой стандарт)

```typescript
export const GET = withApiGuard(
  { auth: "admin", permission: "admin.users.export", rateLimit: {...} },
  async (ctx) => { ... }
);
```

**Статус:** внедрён на admin export; остальные routes — ручной `auth()` + limits (технический долг).

## Защита API (FastAPI)

Все маршруты в `course_progress`, `users`:

```python
dependencies=[Depends(require_internal_api_key)]
```

Production без ключа → fail closed.

## HTTP security headers

Задаются в `next.config.ts` + `middleware` через `lib/security/headers.ts`:

- Content-Security-Policy (restrictive baseline)
- `X-Frame-Options` / frame-ancestors
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy`
- HSTS — через Nginx SSL config (production)

## Файлы и uploads

- Хранение: volume `/app/uploads` (practice, avatars)
- Validation: extension allowlist, size cap, magic bytes (`upload-sandbox.ts`)
- Download: ownership check + rate limit
- PDF certificates: server-side generation, no user HTML in PDF path

## AI safety

- Topic classification + refusal templates
- Pre/post content moderation
- No test answers / practice rubrics in system prompt
- Audit events for abuse patterns (`SecurityAuditLog` when enabled)

## Секреты

| Secret | Назначение |
|--------|------------|
| `AUTH_SECRET` | NextAuth JWT |
| `JWT_SECRET_KEY` | Backend settings |
| `INTERNAL_API_KEY` | Next ↔ FastAPI internal |
| `POSTGRES_PASSWORD` | Database |
| `REDIS_PASSWORD` | Redis |
| `OPENAI_API_KEY` | LLM provider |

**Хранение:** `.env.production` on VPS (`chmod 600`), GitHub Secrets for CI — never commit.

## Аудит

`SECURITY_AUDIT_DB=1` → Prisma `SecurityAuditLog` для:

- auth denied, rate limited, admin actions (по мере внедрения)

## Critical controls (C1–C3) — исправлено

| ID | Риск | Митигация |
|----|------|-----------|
| **C1** | Публичный `GET /api/v1/course-progress` (ПДн) | `deps_auth.require_internal_api_key`: **всегда** `X-API-Key`; иначе 401. `/api/v1/health` без ключа. |
| **C2** | Порты БД/API/pgAdmin на всех интерфейсах | Dev compose: `127.0.0.1:*`. Prod: internal network, наружу только Nginx 80/443. |
| **C3** | Seed при каждом старте frontend | `RUN_SEED=1` только явно; prod — `docker-entrypoint.prod.sh` без seed. |

## Известные риски

| Риск | Уровень | Статус |
|------|---------|--------|
| Horizontal scale без Redis rate limit | Medium | Mitigate: prod Redis |
| Dual schema drift | Medium | Documented; process required |
| Demo seed passwords | High if RUN_SEED=1 on prod | Mitigate: RUN_SEED=0 in prod compose |
| Prompt injection via chat history | Medium | Partial moderation |
| No WAF | Low | Accept or add CDN WAF |

## Сообщение об уязвимостях

Укажите контакт maintainers в README репозитория. Не публикуйте exploit до исправления.

## Compliance notes (учебный контекст)

- Персональные данные студентов (ФИО, email, учебное заведение) — минимизировать экспорт, ограничить доступ ADMIN
- Логи не должны содержать пароли и полные session tokens
