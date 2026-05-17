# Production readiness — итоговая оценка

**Дата ревью:** 2026-05-16 (обновлено: P0 rate limit Server Actions)  
**Версия стека:** Next.js 16 + FastAPI + PostgreSQL + Docker Compose  
**Целевой сценарий:** single-node VPS (production compose + Nginx)

## Оценка готовности: **7.8 / 10**

| Область | Балл | Комментарий |
|---------|------|-------------|
| Безопасность | 7.5 | Сильная база (headers, CSRF, RBAC, audit, upload sandbox); rate limit через Redis в prod |
| Производительность | 7.0 | Multi-stage Docker, standalone Next; тяжёлый frontend-образ, нет CDN/cache layer |
| Архитектура | 6.5 | Рабочий split Next/FastAPI; доменная логика в основном в Next/Prisma |
| DX | 8.0 | Docker-first, design-live, CI, env examples |
| UX | 7.5 | Design system v3, dark mode, loading skeletons |
| Accessibility | 7.0 | Skip-link, focus rings; нет полного WCAG-аудита / e2e a11y |
| SEO | 6.5 | `robots.ts`, `sitemap.ts`, `noindex` на dashboard/admin; Open Graph — P2 |
| CI/CD | 7.5 | Lint, test, compose validate, GHCR release; нет deploy workflow |
| Observability | 6.0 | Healthchecks, optional Prometheus; нет APM/Sentry/central logs |
| Maintainability | 7.5 | Тесты frontend + schema contract; Prisma — единый DDL |

**Вердикт:** после **staging smoke submit** (тест + практика) — готов к **controlled production** (учебный/пилотный VPS). Для **публичного SaaS at scale** — закрыть оставшиеся P1 из [FINAL_CHECKLIST](./checklists/FINAL_CHECKLIST.md).

---

## Критичные остатки (P0)

**Закрыто (C1–C4):**

- C1–C3: internal API key, prod network, seed guards (как ранее).
- **C4 (2026-05-16):** Server Actions `submitTestAttemptAction` / practice actions → `enforceServerActionRateLimit` + Redis (не sync `consumeRateLimit`).

~~Двойная схема БД~~ — снято: Prisma владеет DDL; Alembic no-op ([DATABASE.md](./DATABASE.md)).

## Высокий приоритет (P1)

1. ~~Мигрировать Route Handlers на `withApiGuard`~~ — сделано.
2. ~~E2E smoke: login → course → submit test → submit practice~~ — Playwright `e2e/smoke.spec.ts` + unit tests для `learning-nav` / `dashboard-ui` (2026-05-17).
3. **Staging smoke (обязательно перед go-live):** на VPS/staging с `ENVIRONMENT=production` + `REDIS_URL` — пройти тест и TEXT-практику; убедиться, что нет ложного «Слишком много отправок».
4. ~~CI: job `npm audit` / `pip audit`~~ — `npm audit` critical fail; `pip-audit` в backend job (2026-05-17).
5. Structured logging (JSON) + внешний uptime на `/api/health`.
6. Backup runbook PostgreSQL (pg_dump cron, restore test).

## Рекомендуемые улучшения (P2)

- Open Graph + canonical URLs на маркетинговых страницах.
- Grafana dashboard поверх Prometheus.
- Sentry / OpenTelemetry для frontend и backend.
- Email verification и password reset.
- Consolidate API на FastAPI или явный BFF-контракт в `API.md`.

---

## Связанные документы

| Документ | Назначение |
|----------|------------|
| [checklists/FINAL_CHECKLIST.md](./checklists/FINAL_CHECKLIST.md) | Полный pre-production чеклист |
| [checklists/RELEASE_CHECKLIST.md](./checklists/RELEASE_CHECKLIST.md) | Релиз по тегу / версии |
| [checklists/SECURITY_CHECKLIST.md](./checklists/SECURITY_CHECKLIST.md) | Безопасность |
| [checklists/DEPLOYMENT_CHECKLIST.md](./checklists/DEPLOYMENT_CHECKLIST.md) | Деплой на VPS |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Архитектура |
| [SECURITY.md](./SECURITY.md) | Модель угроз и контроли |
| [OPERATIONS.md](./OPERATIONS.md) | Production / go-live / troubleshooting |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Операции и инфраструктура |
| [API.md](./API.md) | Контракты API |
