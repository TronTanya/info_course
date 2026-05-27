# Production Audit — CyberEdu (May 2026)

Полный production audit репозитория: архитектура, frontend/backend, Next.js App Router, security, ops, CI/CD.

**Стек:** Next.js 16.2.6 · React 19 · NextAuth v5 (JWT) · Prisma/PostgreSQL · Redis · FastAPI · Docker Compose · Nginx · GitHub Actions.

**Связанные документы:** [GO_LIVE_CHECKLIST.md](./GO_LIVE_CHECKLIST.md) · [SECURITY.md](./SECURITY.md) · [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md) · [OPERATIONS.md](./OPERATIONS.md) · [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## Executive summary

CyberEdu — зрелый LMS с **сильным security-слоем** (fail-closed rate limits, CSRF, RBAC из БД для admin API/actions, audit log, обширный Vitest security suite, prod-smoke с Redis в CI).

| Критерий | Балл (1–10) |
|----------|-------------|
| Security engineering | **8.0** |
| Production ops readiness | **7.0** |
| Code quality / architecture | **7.5** |
| Test coverage | **8.0** |
| Performance / scale | **5.5** |
| UX / a11y | **7.5** |
| **Общая оценка** | **7.4 / 10** |

### Go-live readiness

| Сценарий | Score |
|----------|-------|
| Pilot / защита (1 VPS, 1 replica, ops checklist) | **82%** |
| Public production (1000+ MAU, SLA) | **58%** |
| Multi-tenant / compliance-ready | **42%** |

Условие 82%: все пункты [GO_LIVE_CHECKLIST.md](./GO_LIVE_CHECKLIST.md), уникальные секреты, TLS, Redis healthy, backups, admin не из seed.

---

## 1. Архитектура

| Аспект | Оценка | Комментарий |
|--------|--------|-------------|
| Разделение ответственности | ✅ | Next.js — UX, auth, LMS, AI; FastAPI — internal `/api/v1/*` с `X-API-Key` |
| Single source of truth | ⚠️ | Prisma владеет схемой; `course_progress` дублируется в FastAPI/Alembic |
| Масштабирование | ⚠️ | JWT без shared session store; uploads local volume; Redis singleton client |

**Ключевые пути:**

- `cyberedu/frontend/` — основное приложение
- `cyberedu/backend/` — FastAPI (health, internal API)
- `cyberedu/deploy/` — Nginx, Prometheus, VPS scripts
- `cyberedu/docs/ARCHITECTURE.md` — обзор

### P1 — Двойная модель данных (Prisma + FastAPI)

| | |
|---|---|
| **Severity** | P1 |
| **Почему** | Расхождение миграций, разные ORM, риск тихих расхождений в отчётах |
| **Исправление** | Один write-path (только Prisma) или event/outbox; FastAPI — read-only |

```python
# backend: только чтение, schema owned by Prisma migrations
@router.get("/course-progress/{user_id}")
def get_progress(user_id: str, _: None = Depends(require_internal_api_key)):
    ...
```

### P2 — Нет явных bounded contexts

| | |
|---|---|
| **Severity** | P2 |
| **Почему** | `lib/` разрастается; сложнее изолировать AI/practice/auth |
| **Исправление** | `lib/domains/{auth,lms,ai,practice}/` + barrel exports |

---

## 2. Frontend / App Router / Server–Client boundaries

**Сильные стороны:**

- App Router: `(public)`, `dashboard`, `admin`
- Server Components для data fetching; тесты без утечки `isCorrect` (`app/dashboard/course/[moduleId]/test/page.tsx`)
- Server Actions с rate limit + `requireAdminAction`
- `suppressHydrationWarning` + theme init script — осознанный паттерн

**Anti-patterns:**

- ~150+ `"use client"` — нормально для LMS, но landing/dashboard тянут framer-motion
- Мало `next/dynamic` (recharts/highlight не везде lazy)

### P1 — Тяжёлый client bundle (motion + charts + highlight)

| | |
|---|---|
| **Severity** | P1 |
| **Почему** | LCP/TTI на landing; CI допускает `LH_MIN_PERF: 0.58` |
| **Исправление** | Lazy charts; `prefers-reduced-motion` на hero |

```tsx
import dynamic from "next/dynamic";

export const AdminDashboardCharts = dynamic(
  () => import("./admin-dashboard-charts").then((m) => m.AdminDashboardCharts),
  { ssr: false, loading: () => <ChartsSkeleton /> },
);
```

### P2 — Server Actions без единого wrapper

| | |
|---|---|
| **Severity** | P2 |
| **Почему** | Дублирование `auth()` + rate limit + error shape |
| **Исправление** | `createSafeAction({ rateLimit, admin, handler })` |

```ts
// lib/actions/safe-action.ts (sketch)
export function createSafeAction<TIn, TOut>(opts: {
  rateLimit?: ServerActionRateLimitKey;
  admin?: boolean;
  handler: (ctx: { userId: string; input: TIn }) => Promise<TOut>;
}) {
  return async (input: TIn) => {
    const session = opts.admin ? await requireAdminAction() : await auth();
    if (!session?.user?.id) return { error: "Требуется вход." };
    if (opts.rateLimit) {
      const rl = await enforceServerActionRateLimit(opts.rateLimit, session.user.id);
      if (!rl.allowed) return { error: rl.error };
    }
    try {
      return await opts.handler({ userId: session.user.id, input });
    } catch {
      return { error: "Внутренняя ошибка." };
    }
  };
}
```

---

## 3. API Routes

**Паттерн:** `withApiGuard` / `withAuthApiRoute` / `withPublicApiRoute` — `lib/security/api-guard.ts`.

| Маршрут | Guard |
|---------|--------|
| `api/health` | public |
| `api/ai/*` | auth + rate limit |
| `api/admin/*` | admin + DB role |
| `api/practice/*` | auth + presets |
| `api/auth/[...nextauth]` | NextAuth (без api-guard) |

### P1 — `/api/auth/*` вне CSRF (ожидаемо)

| | |
|---|---|
| **Severity** | P1 |
| **Почему** | Brute-force только через login RL в `authorize()` |
| **Исправление** | Nginx `limit_req` на `/api/auth/`; CAPTCHA после N failures |

### P2 — Deprecated `api/ai/adapt-lesson`

| | |
|---|---|
| **Severity** | P2 |
| **Исправление** | 410 Gone + удалить через релиз |

---

## 4. Auth

**Файлы:** `lib/auth.ts`, `middleware.ts`, `lib/permissions.ts`, `lib/security/login-attempts.ts`.

- Credentials + bcrypt (cost 12)
- JWT sessions, `__Secure-*` cookies в production
- Login lockout + rate limits в Redis
- Admin Server Actions: роль из **БД** (`getDbUserRole`)

### P0 — NextAuth `5.0.0-beta.31`

| | |
|---|---|
| **Severity** | P0 |
| **Почему** | Beta в production — нестабильный API и security patch cadence |
| **Исправление** | Pin exact version; план миграции на stable v5; CI review |

### P1 — JWT role vs DB role (окно до 1 ч)

| | |
|---|---|
| **Severity** | P1 |
| **Почему** | `session.updateAge: 3600`; middleware проверяет JWT `role`; promotion admin не мгновенен |
| **Исправление** | DB role check в middleware для `/admin` (Redis cache 60s) |

```ts
// middleware.ts (фрагмент)
if (pathname.startsWith("/admin")) {
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
  if (!token?.sub) return redirectLogin();
  const dbRole = await getDbUserRoleCached(token.sub);
  if (dbRole !== "ADMIN") return NextResponse.redirect(new URL("/", request.url));
}
```

### P1 — Нет MFA / WebAuthn

| | |
|---|---|
| **Severity** | P1 |
| **Исправление** | TOTP для ADMIN; optional passkeys |

### P2 — `authSafe()` глотает ошибки

| | |
|---|---|
| **Severity** | P2 |
| **Исправление** | Structured log + не использовать в security-critical paths |

---

## 5. Prisma / Schema

**Schema:** `frontend/prisma/schema.prisma` · 16 migrations · seed только dev.

**Корректно:** `textExpectedAnswer` не отдаётся клиенту при прохождении теста; `isCorrect` только server-side grading.

### P1 — PrismaClient без pool tuning

| | |
|---|---|
| **Severity** | P1 |
| **Исправление** | PgBouncer в compose; `?connection_limit=` per instance |

### P2 — Нет soft-delete на User

| | |
|---|---|
| **Severity** | P2 |
| **Исправление** | `deletedAt` + расширить `SecurityAuditLog` |

---

## 6. Rate limiting / Redis

**Ядро:** `lib/security/rate-limit-service.ts` — Lua INCR+TTL, production **fail-closed**.

| Policy | Scope |
|--------|-------|
| login | `auth:login` |
| aiChat | `ai:chat` |
| testSubmit | `test:submit` |
| adminMutation | `admin:mutation` |

CI: `rate-limit-redis` job, `scripts/check-rate-limit-production.sh`.

### P0 — Redis outage = deny-all mutating traffic

| | |
|---|---|
| **Severity** | P0 (availability) |
| **Почему** | By design security; платформа «замирает» без Redis |
| **Исправление** | Redis HA (replica/Sentinel); PagerDuty на `rate_limit_denied_unavailable` |

### P1 — Idempotency без Redis = duplicate writes

| | |
|---|---|
| **Severity** | P1 |
| **Почему** | `withIdempotency` в prod без Redis вызывает `run()` без дедупа |
| **Исправление** | Fail-closed как rate limit |

```ts
// lib/security/idempotency.ts
if (!redis) {
  if (isProductionRuntime()) {
    throw new Error("Idempotency unavailable");
  }
  return opts.run();
}
```

### P1 — Fixed window (burst на границе)

| | |
|---|---|
| **Severity** | P1 |
| **Исправление** | Sliding window / token bucket в Redis |

---

## 7. Docker / Production

**Файлы:** `docker-compose.prod.yml`, `frontend/Dockerfile`, `frontend/docker-entrypoint.prod.sh`.

**Сильные стороны:**

- Multi-stage build, non-root `nextjs`
- `frontend-migrate` one-shot
- `RUN_SEED=1` → FATAL в entrypoint
- Secrets не в build-args
- Healthchecks, mem limits
- Redis/Postgres не на host ports

### P0 — Дефолтные секреты из `.env.example`

| | |
|---|---|
| **Severity** | P0 |
| **Исправление** | `scripts/validate-prod-env.sh` в deploy pipeline |

```bash
#!/bin/sh
# scripts/validate-prod-env.sh
forbidden='dev-secret|change-me|Admin12345|Student12345'
if grep -Ei "$forbidden" .env.production; then
  echo "FATAL: weak or demo secrets in .env.production" >&2
  exit 1
fi
```

### P0 — `RUN_SEED=1` / demo users на public

| | |
|---|---|
| **Severity** | P0 |
| **Исправление** | Entrypoint guard (есть) + post-deploy smoke: нет `admin@cyberedu.local` |

### P1 — Single-replica uploads

| | |
|---|---|
| **Severity** | P1 |
| **Почему** | `UPLOADS_DIR` volume; multi-node → 404 |
| **Исправление** | S3/MinIO ([STORAGE.md](./STORAGE.md)) |

### P1 — Nginx без `limit_req`

| | |
|---|---|
| **Severity** | P1 |
| **Исправление** | |

```nginx
# deploy/nginx/conf.d/cyberedu.ssl.conf
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
location /api/ {
  limit_req zone=api burst=60 nodelay;
  proxy_pass http://cyberedu_frontend;
}
```

---

## 8. CI/CD

**Workflow:** `.github/workflows/ci.yml`

- lint, typecheck, vitest, prisma validate
- npm audit (high+), pip-audit
- Redis rate-limit integration
- Playwright: smoke, a11y, visual
- Staging smoke: `ENVIRONMENT=production` + Redis
- Docker build smoke

### P1 — pip-audit ignore `PYSEC-2026-161` (starlette)

| | |
|---|---|
| **Severity** | P1 |
| **Исправление** | Ticket с датой пересмотра при релизе fix на PyPI |

### P1 — Lighthouse `LH_MIN_PERF: 0.58`

| | |
|---|---|
| **Severity** | P1 |
| **Исправление** | Поднять до 0.75 поэтапно; bundle analyzer в CI |

---

## 9. Playwright / Testing

| Config | Назначение |
|--------|------------|
| `playwright.config.ts` | E2E smoke |
| `playwright.a11y.config.ts` | axe |
| `playwright.visual.config.ts` | Visual regression |
| `playwright.prod.config.ts` | Production-like smoke |

**Vitest security:** `tests/security-*.test.ts`, `tests/api-guard.test.ts`, `tests/rate-limit*.test.ts`.

### P1 — Visual tests flaky

| | |
|---|---|
| **Исправление** | Deterministic fonts; `maxDiffPixels`; отдельный CI shard |

### P2 — Нет load/soak tests

| | |
|---|---|
| **Исправление** | k6 на `/api/health`, login, test submit |

---

## 10. UX / UI / Accessibility / SEO

| Область | Статус |
|---------|--------|
| a11y | Skip link, `@axe-core/playwright`, `LH_MIN_A11Y: 0.88` |
| SEO | metadata, OG, `admin` → `robots: noindex` |
| UX | onboarding, form drafts, test keyboard nav |

### P2 — `dangerouslySetInnerHTML` (theme, JSON-LD, AI code)

| | |
|---|---|
| **Severity** | P2 |
| **Исправление** | DOMPurify на highlight output |

```tsx
import DOMPurify from "isomorphic-dompurify";

const html = useMemo(() => {
  const raw = hljs.highlight(code, { language: lang }).value;
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: ["span"],
    ALLOWED_ATTR: ["class"],
  });
}, [code, lang]);
```

---

## 11. Security (сводка)

| Контроль | Статус | Файлы |
|----------|--------|-------|
| CSRF API | ✅ | `middleware.ts`, `lib/security/csrf.ts` |
| CSP | ⚠️ enforce + `unsafe-inline` | `lib/security/headers.ts` |
| HSTS | ✅ | production headers |
| Upload sandbox | ✅ | `lib/security/upload-sandbox.ts` |
| Login lockout | ✅ | `lib/security/login-attempts.ts` |
| Admin RBAC | ✅ DB | `api-guard.ts`, `admin-action-guard.ts` |
| Audit log | ✅ | `lib/security/audit.ts` |
| Internal API | ✅ | `backend/src/api/deps_auth.py` |
| TRUSTED_PROXY | ✅ | `instrumentation.ts`, `request-ip.ts` |

### P0 — Dev routes `/api/dev/*` при misconfig

| | |
|---|---|
| **Severity** | P0 |
| **Почему** | `ENVIRONMENT=development` на staging с public DNS → reset demo passwords |
| **Исправление** | Redirect в prod build |

```ts
// next.config.ts
async redirects() {
  if (process.env.NODE_ENV === "production") {
    return [{ source: "/api/dev/:path*", destination: "/404", permanent: false }];
  }
  return [];
}
```

### P1 — `expectedAnswerPattern` на клиенте (practice)

| | |
|---|---|
| **Severity** | P1 |
| **Исправление** | Grading только server-side; клиенту `needsExplanation: boolean` |

### P1 — AI prompt injection

| | |
|---|---|
| **Mitigation** | Trusted server history, moderation pipeline, `tests/security-ai-tutor.test.ts` |
| **Исправление** | Output classifier; block «дай ответ теста» |

---

## 12. Performance / Race conditions

| Issue | Severity |
|-------|----------|
| Redis client singleton (OK in Docker, bad in serverless) | P2 |
| Double test submit без idempotency при Redis down | P1 |
| Framer-motion без `useReducedMotion` | P2 |
| Мало code-splitting | P1 |

**Позитив:** `module-test-runner.tsx` использует `crypto.randomUUID()` для idempotency key.

---

## 13. Критические блокеры production

Перед **публичным** launch обязательно:

1. Уникальные секреты (не из `.env.example`)
2. `RUN_SEED=0`, нет demo `*.local` в prod DB
3. Redis monitored + HA plan
4. TLS deployed (`cyberedu.ssl.conf`), HSTS
5. Risk acceptance или migration с NextAuth beta
6. **Single replica** frontend (или shared storage)
7. Admin создан вручную ([OPERATIONS.md](./OPERATIONS.md))
8. Backup + restore drill (`scripts/backup-production.sh`, `scripts/restore-drill.sh`)

---

## 14. Roadmap (90 дней)

### Phase 0 — pre-launch (1–2 недели)

- [x] `validate-prod-env.sh` в `vps-deploy.sh`
- [x] Strip `/api/dev` в production build (middleware + `next.config` redirect)
- [x] Idempotency fail-closed
- [x] Nginx `limit_req` (`nginx.conf` zones + `cyberedu.ssl.conf.example`)
- [x] Lighthouse perf threshold 0.58 → 0.62 (поэтапно к 0.75)

### Phase 1 — 0–30 дней

- [ ] MFA для admin
- [ ] S3/MinIO uploads
- [ ] PgBouncer
- [ ] NextAuth stable
- [ ] DOMPurify на AI HTML
- [ ] Убрать `expectedAnswerPattern` с клиента

### Phase 2 — 30–60 дней

- [ ] Redis Sentinel
- [ ] Centralized logging + alerting
- [ ] Bundle budget CI
- [ ] k6 load tests

### Phase 3 — 60–90 дней

- [ ] Horizontal scale (sticky sessions / session store)
- [ ] FastAPI read-only
- [ ] CAPTCHA on auth
- [ ] CSP nonce (Next 16)
- [ ] GDPR export/delete

---

## 15. Findings index

| ID | Sev | Область | Кратко |
|----|-----|---------|--------|
| SEC-01 | P0 | Secrets | Дефолтные / demo secrets в prod |
| SEC-02 | P0 | Seed | `RUN_SEED=1` или demo users |
| SEC-03 | P0 | Auth | NextAuth v5 beta |
| OPS-01 | P0 | Redis | Outage → deny-all |
| SCALE-01 | P1 | Storage | Local uploads, single replica |
| SCALE-02 | P1 | Sessions | JWT без shared store |
| AUTH-01 | P1 | JWT | Role staleness в middleware |
| IDEM-01 | P1 | Redis | Idempotency bypass |
| EDGE-01 | P1 | Nginx | Нет edge rate limit |
| PERF-01 | P1 | Bundle | Motion/charts/highlight |
| AI-01 | P1 | XSS | AI `dangerouslySetInnerHTML` |
| DATA-01 | P1 | ORM | Prisma + FastAPI dual schema |

---

## Appendix: ключевые файлы

| Область | Путь |
|---------|------|
| Auth | `frontend/lib/auth.ts` |
| Middleware | `frontend/middleware.ts` |
| API guard | `frontend/lib/security/api-guard.ts` |
| Rate limit | `frontend/lib/security/rate-limit-service.ts` |
| Headers/CSP | `frontend/lib/security/headers.ts` |
| Server Actions RL | `frontend/lib/security/server-action-rate-limit.ts` |
| Idempotency | `frontend/lib/security/idempotency.ts` |
| Prisma | `frontend/prisma/schema.prisma` |
| Prod compose | `docker-compose.prod.yml` |
| CI | `.github/workflows/ci.yml` |
| Go-live | `docs/GO_LIVE_CHECKLIST.md` |

---

*Audit date: 2026-05-26 · Reviewer lens: production security + ops (Stripe/Vercel-grade checklist)*
