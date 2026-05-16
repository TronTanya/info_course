# Production readiness — итоговая оценка

**Дата ревью:** 2026-05-16  
**Версия стека:** Next.js 16 + FastAPI + PostgreSQL + Docker Compose  
**Целевой сценарий:** single-node VPS (production compose + Nginx)

## Оценка готовности: **7.2 / 10**

| Область | Балл | Комментарий |
|---------|------|-------------|
| Безопасность | 7.5 | Сильная база (headers, CSRF, RBAC, audit, upload sandbox); остаются in-memory rate limit, неполный `withApiGuard`, dual-schema |
| Производительность | 7.0 | Multi-stage Docker, standalone Next; тяжёлый frontend-образ, нет CDN/cache layer |
| Архитектура | 6.5 | Рабочий split Next/FastAPI; доменная логика в основном в Next/Prisma |
| DX | 8.0 | Docker-first, design-live, CI, env examples |
| UX | 7.5 | Design system v3, dark mode, loading skeletons |
| Accessibility | 7.0 | Skip-link, focus rings; нет полного WCAG-аудита / e2e a11y |
| SEO | 5.5 | Metadata на страницах; нет `robots.txt`, `sitemap`, Open Graph |
| CI/CD | 7.5 | Lint, test, compose validate, GHCR release; нет deploy workflow |
| Observability | 6.0 | Healthchecks, optional Prometheus; нет APM/Sentry/central logs |
| Maintainability | 7.0 | Тесты frontend; дублирование схем Prisma + Alembic |

**Вердикт:** готов к **controlled production** (учебный/пилотный VPS с мониторингом uptime и ручным релизом). Для **публичного SaaS at scale** — закрыть пункты из [FINAL_CHECKLIST](./checklists/FINAL_CHECKLIST.md) (P0/P1).

---

## Критичные остатки (P0)

**Закрыто (C1–C3):** course-progress/users только с `X-API-Key`; prod compose без публичных DB/Redis; seed только при `RUN_SEED=1`; dev-порты на `127.0.0.1`.

1. **Rate limit в памяти** — при нескольких репликах frontend лимиты не общие; в prod compose Redis есть, но не все пути гарантированно используют `REDIS_URL`.
2. **Двойная схема БД** (Prisma + SQLAlchemy/Alembic) — риск рассинхронизации при миграциях.

## Высокий приоритет (P1)

1. Мигрировать оставшиеся Route Handlers на `withApiGuard` (единый auth, RBAC, audit).
2. E2E smoke (Playwright): login → course → lesson → test.
3. CI: job `npm audit` / `pip audit` (опционально fail on critical).
4. Structured logging (JSON) + внешний uptime на `/api/health`.
5. Backup runbook PostgreSQL (pg_dump cron, restore test).

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
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Операции и инфраструктура |
| [API.md](./API.md) | Контракты API |
