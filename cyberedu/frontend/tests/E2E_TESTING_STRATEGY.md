# CyberEdu E2E Testing Strategy

Production-grade Playwright suite aligned with Vercel-style QA: fast feedback in CI, stable selectors, minimal flake, clear ownership of flows.

## Goals

| Layer | Purpose | When it runs |
|-------|---------|--------------|
| **Smoke** (`@smoke`) | Critical paths: auth API, dashboard, course test/practice, logout, health | Every PR (`e2e-smoke` CI job) |
| **E2E** (`tests/e2e/**`) | User journeys, validation, admin visibility, registration | PR + local before merge |
| **A11y** (`tests/a11y/**`) | axe-core on public + authenticated shells | PR (fast, no DB writes) |
| **Visual** (`tests/visual/**`) | Screenshot regression on stable routes | Main branch / manual (`test:e2e:visual`) |
| **Prod smoke** (`tests/prod-smoke/**`) | `ENVIRONMENT=production` + Redis + DB persistence | CI `e2e-prod-smoke` |

Unit/integration tests (Vitest) own rate-limit math, upload sandbox, middleware. E2E proves **wiring** and **no false positives** in UI.

## Directory layout

```
cyberedu/frontend/
├── e2e/                          # Global setup, legacy helpers (stable imports)
│   ├── global-setup.ts
│   ├── global-setup.prod.ts
│   ├── test-credentials.ts
│   └── helpers/
│       ├── auth.ts               # credentialsSignIn, loginAs, logout
│       ├── course-flow.ts        # test/practice/lesson navigation
│       ├── verification.ts       # DB tokens, rate-limit reset
│       └── persistence.ts        # PostgreSQL assertions (prod smoke)
├── tests/
│   ├── E2E_TESTING_STRATEGY.md   # this file
│   ├── fixtures/
│   │   └── index.ts              # extended test + studentPage / adminPage
│   ├── helpers/
│   │   ├── index.ts
│   │   ├── navigation.ts
│   │   ├── admin.ts
│   │   ├── uploads.ts
│   │   ├── hydration.ts
│   │   └── rate-limit.ts
│   ├── mocks/
│   │   ├── api-routes.ts
│   │   └── network.ts
│   ├── e2e/
│   │   ├── smoke.spec.ts         # @smoke serial suite
│   │   ├── auth/
│   │   ├── course/
│   │   ├── admin/
│   │   ├── navigation/
│   │   ├── public/
│   │   └── errors/
│   ├── a11y/
│   ├── visual/
│   └── prod-smoke/
├── playwright.config.ts
├── playwright.prod.config.ts
├── playwright.visual.config.ts
└── playwright.a11y.config.ts
```

## User flow matrix

| Flow | Spec(s) | Helpers | Notes |
|------|---------|---------|-------|
| Landing / public | `landing-public.spec.ts`, `public-errors` | `hydration.gotoStable` | `reducedMotion` for CLS |
| Register + verify email | `email-verification-flow.spec.ts` | `verification.*` | Fallback `createE2eUnverifiedUser` if UI rate-limited |
| Login validation | `auth-login-validation.spec.ts` | — | Client Zod before network |
| Password reset validation | `auth-password-reset-validation.spec.ts` | — | |
| Login / logout | `smoke.spec.ts` | `loginAs`, `logout`, `assertLoggedOut` | **API login** avoids hydration race on form GET |
| Course map → lesson | `course/lesson-open.spec.ts` | `openFirstLessonPage` | Seed URLs via DOM evaluate |
| Module test | `smoke.spec.ts`, prod-smoke | `submitModuleTest` | Serial; 120s timeout |
| Practice TEXT / FILE | `smoke`, `course/practice-upload` | `submitPracticeTextIfPresent`, `uploadPracticeFile` | FILE skipped if seed has TEXT only |
| Profile / portfolio | `profile-portfolio.spec.ts` | `loginAs` | |
| Admin users/reviews | `admin-*.spec.ts`, `admin-routes.smoke` | `admin.expectAdminHeading` | Desktop table visibility |
| Command palette | `smoke` | `data-testid` | |
| Certificate verify | `smoke` | `E2E_CERT_VERIFY_CODE` from global-setup | |
| Rate limit (false positive) | smoke + prod-smoke | `RATE_LIMIT_ERROR` regex | Vitest owns policy; E2E owns UX |
| API health | smoke, prod-smoke | `request.get('/api/health')` | prod requires `redis: ok` |

## Anti-flake playbook

### 1. Hydration (Next.js App Router)

- Prefer **`credentialsSignIn` via `/api/auth/callback/credentials`** over clicking «Войти» before React hydrates.
- Use `gotoStable()` → `domcontentloaded` + visible `#main-content` or `role=main`.
- Avoid `waitForTimeout` except CLS measurement (landing budget test).

### 2. Race conditions

- **Serial** suites: `smoke.spec.ts`, `email-verification-flow`, prod-smoke (`test.describe.configure({ mode: 'serial' })`).
- **Parallel-safe**: validation-only auth specs, landing, a11y, visual (read-only).
- `Promise.all([page.waitForURL(...), btn.click()])` on logout.

### 3. Timing

- Default `expect.timeout: 15_000`; smoke test submit `120_000`.
- `expect.poll()` for session email after verify.
- `openFirstTestPage` uses DOM href discovery — resilient to UI copy changes.

### 4. Test data isolation

- `resetAuthStorage(context)` in `beforeEach` for auth specs.
- `resetServerAuthGuards(emails)` + `ensureE2eDemoUsersReady()` when `E2E_USE_SEED_CREDENTIALS=1`.
- Unique emails: `e2e-verify-${Date.now()}@cyberedu.local`.
- Prod smoke: isolated Postgres DB per CI job; never production URLs.

### 5. Selectors (priority)

1. `getByRole` + accessible name (Russian copy is stable product contract)
2. `getByLabel`
3. `getByTestId` for complex widgets (`command-palette-*`, `admin-*-table-wrap`)
4. CSS only for href discovery in `page.evaluate` fallbacks

## Fixtures

```typescript
import { test, expect } from "../fixtures";

test("dashboard", async ({ studentPage }) => {
  await studentPage.goto("/dashboard");
  await expect(studentPage.getByRole("heading", { name: /Центр управления/i })).toBeVisible();
});
```

`studentPage` / `adminPage` call `loginAs` once per test — use for read-only flows. For logout tests, use raw `page` + `loginAs` to avoid fixture side effects.

## Mocks

Use `tests/mocks/api-routes.ts` for **deterministic error UI** (503, 429) without hammering Redis:

```typescript
await mockJsonRoute(page, "**/api/practice/upload-file", { status: 429, body: { error: "..." } });
```

Do **not** mock auth or Prisma paths in smoke/prod-smoke — those validate real integration.

## CI integration

| Job | Command | Services |
|-----|---------|----------|
| `e2e-smoke` | `npm run test:e2e:smoke` + full `test:e2e` | Postgres |
| `e2e-prod-smoke` | `npm run test:e2e:staging` | Postgres + Redis |
| Lighthouse | `perf:lighthouse:ci` | Same app instance |

Artifacts on failure: `playwright-report`, `e2e-results`, traces (`retain-on-failure`).

### Recommended local commands

```bash
# Full local E2E (app must be running on :3100)
cd cyberedu/frontend
npx prisma migrate deploy && npm run db:seed
npm run build && npm run start &
npm run test:e2e

# Smoke only (~3–8 min)
npm run test:e2e:smoke

# Production-like (Redis required)
npm run test:e2e:prod:local

# A11y / visual
npm run test:e2e:a11y
npm run test:e2e:visual
npm run test:e2e:visual:update   # accept new baselines
```

## Parallel execution

| Project | Workers | `fullyParallel` |
|---------|---------|-----------------|
| `desktop` / `mobile` | 2 in CI, default locally | `true` except `@serial` files |
| `smoke` | 1 | `false` |
| `a11y` | 2 | `true` |
| `visual` | 1 | `false` (snapshot stability) |

Tag convention: `@smoke`, `@serial` (grep invert for parallel CI shard later).

## Missing coverage (backlog)

| Priority | Area | Suggested spec |
|----------|------|----------------|
| P0 | Admin CRUD write | `admin/module-create.spec.ts` with teardown |
| P0 | FILE_UPLOAD practice E2E | `course/practice-upload.spec.ts` (needs seed FILE task) |
| P1 | Avatar upload profile | `profile/avatar-upload.spec.ts` |
| P1 | Forgot password happy path | DB token helper like verify-email |
| P1 | Student → admin RBAC | `auth/rbac.spec.ts` |
| P1 | Dashboard all sidebar links | extend `navigation/dashboard-navigation` |
| P2 | AI mentor chat | mock OpenAI route |
| P2 | Certificate PDF download | `request` + Content-Disposition |
| P2 | Reviews submit (student) | unique user + moderation |
| P2 | Settings / password change | serial |
| P3 | Real rate-limit 429 UI | dedicated spec + `e2e-reset-auth` between attempts |
| P3 | Cross-browser (firefox/webkit) | nightly only |
| P3 | Live production smoke | `PLAYWRIGHT_BASE_URL=https://...` read-only, no seed |

## Production smoke (live staging)

Read-only checks against deployed URL — **no** `E2E_USE_SEED_CREDENTIALS`, use secrets `E2E_STUDENT_EMAIL/PASSWORD`:

- `GET /api/health` → 200
- Login → dashboard heading
- Public `/`, `/reviews`, certificate verify invalid code

Run from ops (`docs/OPERATIONS.md`), not on every PR.

## Ownership

- **Platform / infra**: `playwright.config.ts`, global-setup, CI jobs
- **Product flows**: `tests/e2e/*` per feature area
- **Design / UX**: `e2e/screenshots.spec.ts`, `tests/visual/*`
- **Security**: Vitest rate-limit + upload; E2E confirms no regression messages
