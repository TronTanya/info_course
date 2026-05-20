# UX screenshots

Real CyberEdu UI captures for the **portfolio README**, thesis defense, and onboarding.

**Portfolio README:** [`../../../README.md`](../../../README.md#screenshots)  
**Regenerate:** `cd cyberedu/frontend && npm run screenshots`

## Automated generation (recommended)

1. Run the app with seed data:

   ```bash
   cd cyberedu
   RUN_SEED=1 docker compose up -d postgres
   cd frontend && npm run db:seed   # first time
   npm run dev   # port 3100; use dev, not `start`, for Playwright login (Secure cookies + HTTP)
   ```

2. Generate PNG (1280×720, Playwright):

   ```bash
   cd cyberedu/frontend
   npm run screenshots
   ```

Script: [`e2e/screenshots.spec.ts`](../../frontend/e2e/screenshots.spec.ts) · config: `playwright.screenshots.config.ts`.

Credentials: seed/E2E (`E2E_USE_SEED_CREDENTIALS=1`). Override: `E2E_STUDENT_EMAIL`, `E2E_STUDENT_PASSWORD`, `E2E_ADMIN_*`.

Output is copied to `docs/screenshots/` and `frontend/public/screenshots/`.

## Files

| File | Screen | In portfolio README |
|------|--------|---------------------|
| `01-landing.png` | Landing (`/`) | Yes |
| `09-login.png` | Login (`/auth/login`) | Yes |
| `02-dashboard.png` | Student dashboard | Yes |
| `03-course.png` | Course map | Yes |
| `04-lesson.png` | Lesson | Yes |
| `05-test.png` | Module test | Yes |
| `06-practice.png` | Practice lab | Yes |
| `07-admin.png` | Admin LMS dashboard | Yes |
| `08-certificate.png` | Certificate (`/dashboard/certificate`) | Yes |

## Publication rules

- PNG or WebP, width 1280–1920 px
- No real PII, API keys, or secrets in URLs
- Consistent theme (light/dark) within a set

## Manual capture

Log in as `student@cyberedu.local` / `admin@cyberedu.local` (password from local `.env`, never commit). Save files with the names above.

More: [../OPERATIONS.md](../OPERATIONS.md#ux-screenshots).
