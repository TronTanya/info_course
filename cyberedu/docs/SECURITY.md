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

| Зона | Лимит (ориентир) | Реализация |
|------|------------------|------------|
| Login (authorize) | 25 / 15 min / IP | `checkLoginRateLimit` + `checkCredentialsCallbackRateLimit` в `lib/auth.ts` → Redis |
| Credentials callback | 20 / 15 min / IP | Тот же путь в `authorize()` (Node.js + Redis; не Edge middleware) |
| Register | 8 / IP·час, 5 / email·сутки | `registerAction` → Redis |
| AI chat / lesson adapt | 60 / 40 per hour / user | **`withApiGuard` only** (без дубля в middleware) |
| Certificate verify | 40 / 15 min / IP | page + Redis |
| Admin export | 10 / hour | `withApiGuard` → Redis |
| Practice API checks / upload | 40 / 20 per hour | `withApiGuard` → Redis |
| **Test submit (Server Action)** | 40 / hour / user | `enforceServerActionRateLimit` → Redis |
| **Practice submit (Server Action)** | 45–80 / hour / user | `enforceServerActionRateLimit` → Redis |

Источник: `lib/security/rate-limit-service.ts` (fixed window + TTL).

- **Production (`ENVIRONMENT=production`):** только Redis (`REDIS_URL` в compose). Без Redis — **fail-closed** (`reason: unavailable`), не bypass.
- **Development:** in-memory fallback с `console.warn` (не shared между репликами).

Server Actions: `lib/security/server-action-rate-limit.ts`.  
**Не использовать** sync `consumeRateLimit` / `consumeRateLimitSyncDevOnly` в middleware, handlers или actions (в production → deny-all).

### API guard

```typescript
export const GET = withApiGuard(
  { requireAdmin: true, permission: "admin:export", rateLimit: "adminExport" },
  async ({ session, ip }) => { ... }
);
```

**Статус:** все Route Handlers в `app/api/**` на `withApiGuard` / `withAuthApiRoute` / `withPublicApiRoute`. Admin CSV export — `requireAdmin` + `logAdminSecurityEvent` (без email в audit meta).

## Защита API (FastAPI)

Все маршруты в `course_progress`, `users`:

```python
dependencies=[Depends(require_internal_api_key)]
```

Production без ключа → fail closed.

## HTTP security headers

Источник: `frontend/lib/security/headers.ts`, применяется в **`next.config.ts`** (`headers()`) и **`middleware.ts`** (`applySecurityHeaders`) — все HTML/API-ответы приложения, включая `_next/static` (через config).

### Rollout CSP (сначала report-only, потом enforce)

| Этап | `CSP_MODE` | Заголовок |
|------|------------|-----------|
| 1 — мониторинг (default prod) | `report-only` или не задан | `Content-Security-Policy-Report-Only` |
| 2 — блокировка | `enforce` | `Content-Security-Policy` |
| Dev / отладка | `off` (default) | CSP не отправляется |

Политика **одинакова** в report-only и enforce — нарушения видны в отчётах до включения блокировки. Готовая строка: `getEnforceReadyCsp()` в коде.

Опционально: `CSP_REPORT_URI=/api/csp-report` (нужен свой Route Handler для приёма отчётов).

```bash
# production (.env.production)
CSP_MODE=report-only
# после 1–2 недель без ложных срабатываний:
CSP_MODE=enforce
```

### Заголовки (production security)

`isProductionSecurity()` = `ENVIRONMENT=production` **или** `NODE_ENV=production` (в Docker dev-образе задайте `ENVIRONMENT=development`, чтобы не включать HSTS на localhost).

| Header | Значение | Назначение |
|--------|----------|------------|
| **Content-Security-Policy** / **-Report-Only** | см. rollout | XSS, injection; `frame-ancestors 'none'` |
| **Strict-Transport-Security** | `max-age=63072000; includeSubDomains; preload` | HSTS только в production |
| **X-Frame-Options** | `DENY` | Clickjacking (дублирует CSP `frame-ancestors`) |
| **X-Content-Type-Options** | `nosniff` | MIME sniffing |
| **Referrer-Policy** | `strict-origin-when-cross-origin` | Утечка URL |
| **Permissions-Policy** | restrictive defaults | Отключение camera/mic/geo/payment… |
| **Cross-Origin-Opener-Policy** | `same-origin` | Изоляция окон |
| **Cross-Origin-Resource-Policy** | `same-site` | Ограничение встраивания ресурсов |
| **X-DNS-Prefetch-Control** | `off` | DNS prefetch |
| **X-Permitted-Cross-Domain-Policies** | `none` | Flash/PDF cross-domain |

Nginx может **дополнительно** выставить HSTS на edge — дублирование с приложением допустимо.

### CSP и Next.js (не ломаем assets)

| Директива | Разрешено | Зачем |
|-----------|-----------|--------|
| `default-src` | `'self'` | Базовый origin |
| `script-src` | `'self' 'unsafe-inline'` (+ `'unsafe-eval'` в dev) | Next.js chunks / React Refresh |
| `style-src` | `'self' 'unsafe-inline'` | CSS-in-JS / Tailwind |
| `img-src` | `'self' data: blob:` | `next/image`, аватары, canvas |
| `font-src` | `'self' data:` | `@fontsource` / локальные шрифты |
| `connect-src` | `'self'` + app origin + `NEXT_PUBLIC_API_URL` + AI API origin | `/api/*`, FastAPI, LLM |
| `worker-src` | `'self' blob:` | Web workers |
| `media-src` | `'self' blob:` | Медиа в практикумах |
| `manifest-src` | `'self'` | PWA manifest |
| `frame-ancestors` | `'none'` | Встраивание в iframe запрещено |
| `form-action` | `'self'` | Формы auth/settings |
| `object-src` | `'none'` | Плагины |
| `upgrade-insecure-requests` | production only | HTTPS upgrade |

Middleware **не** матчит `_next/static`, `_next/image`, `favicon.ico`, `brand/` — статика всё равно получает заголовки из `next.config.ts`.

### Тесты

```bash
cd frontend && npm run test -- tests/security-headers.test.ts
```

## Файлы и uploads

- Хранение: `StorageService` local → volume `/app/uploads` (**single replica**); см. [STORAGE.md](./STORAGE.md)
- Доступ: только через auth API (не public static dir)
- Validation: extension allowlist, size cap, magic bytes (`upload-sandbox.ts`)
- `UPLOAD_STORAGE_DRIVER=s3` — **не реализован** (skeleton only)
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

## Аудит (SecurityAuditLog)

`SECURITY_AUDIT_DB=1` (default) → запись в `security_audit_log` + JSON в stdout (SIEM).

**Helper:** `logSecurityEvent({ userId, action, targetId, metadata, ip, path })` — `lib/security/audit.ts`  
**Admin mutations:** `logAdminSecurityEvent(adminId, action, targetId, metadata)` — обязателен после успешной мутации.

| action | Когда |
|--------|--------|
| `auth.login.success` / `auth.login.failed` | Вход (без email/пароля в meta) |
| `admin.user.role_change` | Смена роли (`updateUserRoleAction`) |
| `admin.users.csv_export` | Выгрузка CSV |
| `admin.practice.review` | Проверка отправки практики |
| `admin.content.publish` / `unpublish` | Отзывы, модули (`isActive`) |
| `certificate.generate` | Выдача сертификата |
| `certificate.verify.abuse` | Rate limit на verify |
| `certificate.verify.failed` | Неверный код (только `codePrefix`, не полный код) |
| `ai.safety.refusal` | Отказ AI tutor (без prompt/ответа) |

**Не логируем:** пароли, токены, полный verification code, тела AI-сообщений, email в metadata.  
**IP:** только нормализованный (`normalizeAuditIp`) — валидный IPv4/IPv6 или `direct` / `invalid`.

Поля записи: `actorId` (userId), `action`, `targetId`, `meta`, `createdAt`, `severity`, `path`, `ip`.

## Critical controls (C1–C3) — исправлено

| ID | Риск | Митигация |
|----|------|-----------|
| **C1** | Публичный `GET /api/v1/course-progress` (ПДн) | `deps_auth.require_internal_api_key`: **всегда** `X-API-Key`; иначе 401. `/api/v1/health` без ключа. |
| **C2** | Порты БД/API/pgAdmin на всех интерфейсах | Dev compose: `127.0.0.1:*`. Prod: internal network, наружу только Nginx 80/443. |
| **C3** | Seed при каждом старте frontend | `RUN_SEED=1` только явно; prod — `docker-entrypoint.prod.sh` без seed. |

## Автоматические тесты (Vitest)

Перед релизом: `cd cyberedu/frontend && npm test` (или `npm run test:security` для security-фокуса).

| Область | Файлы |
|---------|--------|
| CSRF negative (Origin/Referer, middleware 403) | `tests/security-csrf.test.ts`, `tests/security-suite.test.ts` |
| RBAC: USER не в `/admin`, unauthenticated → login | `tests/security-rbac.test.ts` |
| Upload validation (sandbox + practice API) | `tests/security-upload.test.ts`, `tests/practice-files.test.ts` |
| Rate limit (prod fail-closed, Server Actions) | `tests/rate-limit-service.test.ts`, `tests/server-action-rate-limit.test.ts`, `tests/submit-actions-rate-limit.test.ts`, `tests/security-submit-production.test.ts` |
| Certificate verify rate limit + safe copy | `tests/security-certificate-verify.test.ts` |
| AI safety (без готовых ответов теста/практики) | `tests/security-ai-tutor.test.ts`, `tests/tutor-prompt-injection.test.ts` |
| Контракты в коде (regression) | `tests/security-suite.test.ts` |

Интеграция Redis (опционально, нужен живой Redis): `npm run test:rate-limit:redis`.

E2E (Playwright, не Vitest): `npm run test:e2e`, production-like — `npm run test:e2e:prod` ([OPERATIONS.md](./OPERATIONS.md)).

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
