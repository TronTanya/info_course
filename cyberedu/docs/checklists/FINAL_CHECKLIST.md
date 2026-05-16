# FINAL CHECKLIST — production readiness

Используйте перед первым production-запуском и перед каждым major-релизом. Отмечайте `[x]` только при проверке на **staging**, максимально близком к prod.

## 1. Безопасность

- [ ] `AUTH_SECRET`, `JWT_SECRET_KEY`, `INTERNAL_API_KEY`, `POSTGRES_PASSWORD`, `REDIS_PASSWORD` — уникальные, ≥32 символов, не в git
- [ ] `RUN_SEED=0` в production compose
- [ ] `ENVIRONMENT=production` на backend; `/docs` отключены
- [ ] `INTERNAL_API_KEY` задан; backend `/api/v1/*` без ключа возвращает 401/403
- [ ] `CORS_ORIGINS` — только production-домен(ы)
- [ ] `AUTH_URL` / `NEXT_PUBLIC_APP_URL` совпадают с публичным HTTPS URL
- [ ] `TRUSTED_PROXY=1` за Nginx
- [ ] Redis включён в prod (rate limit / sessions при масштабировании)
- [ ] pgAdmin и Postgres **не** опубликованы наружу (только internal network)
- [ ] Демо-учётки удалены или пароли сменены
- [ ] Проверка CSRF: mutating `/api/*` без cookie/origin → 403
- [ ] Admin export CSV только для `ADMIN`
- [ ] Upload practice: лимиты размера, magic bytes, sandbox path
- [ ] AI: moderation pipeline, rate limits, нет утечки эталонов тестов в промпт

## 2. Производительность

- [ ] `docker compose -f docker-compose.prod.yml build` успешен
- [ ] Frontend healthcheck green (`/api/health`)
- [ ] Backend healthcheck green (`/api/v1/health`)
- [ ] Nginx gzip включён; `client_max_body_size` достаточен для upload
- [ ] `UVICORN_WORKERS` согласован с CPU (2–4 на 2 vCPU)
- [ ] Smoke: главная, login, dashboard, один модуль курса < 3s TTFB (ориентир)

## 3. Архитектура и данные

- [ ] `frontend-migrate` завершился успешно перед стартом app
- [ ] Prisma migrations применены на staging DB
- [ ] Alembic (backend) — схема совместима или миграции применены осознанно
- [ ] Резервная копия БД настроена (см. DEPLOYMENT.md)
- [ ] Volumes: `postgres_data`, `frontend_uploads` на persistent disk

## 4. DX и качество кода

- [ ] CI green на `main` (lint, typecheck, vitest, pytest, docker build)
- [ ] `npm run typecheck` и `npm run test` локально
- [ ] `.env.production` не закоммичен
- [ ] CHANGELOG / release notes для релиза

## 5. UX и accessibility

- [ ] Light/dark theme работает на ключевых страницах
- [ ] Skip-link «Перейти к содержимому» работает
- [ ] Формы login/register с label и сообщениями об ошибках
- [ ] Мобильная навигация (drawer) доступна с клавиатуры
- [ ] `prefers-reduced-motion` не ломает layout

## 6. SEO (публичная часть)

- [ ] `metadata` title/description на `/`, `/reviews`, auth pages
- [ ] `robots.txt` и `sitemap.xml` (если нужна индексация) — *сейчас отсутствуют*
- [ ] Favicon и brand assets отдаются с кэшем
- [ ] Страницы `/dashboard/*`, `/admin/*` не индексируются (`noindex` — рекомендуется)

## 7. CI/CD

- [ ] GitHub Actions CI проходит на PR
- [ ] Release workflow (тег `v*.*.*`) публикует GHCR (если используется)
- [ ] План отката: предыдущий image tag + DB backup

## 8. Observability

- [ ] Uptime monitor на `https://<domain>/api/health` и `/nginx-health`
- [ ] `docker compose logs` доступны; ротация json-file настроена
- [ ] (Опционально) профиль `monitoring` — Prometheus на localhost
- [ ] Алерт при 5xx / disk > 80%

## 9. Maintainability

- [ ] Документация актуальна: ARCHITECTURE, SECURITY, DEPLOYMENT, API
- [ ] Onboarding: новый разработчик поднимает stack за < 30 мин по README
- [ ] Известные tech debt зафиксированы в PRODUCTION_READINESS.md

---

## Sign-off

| Роль | Имя | Дата | Подпись |
|------|-----|------|---------|
| Engineering | | | |
| Security | | | |
| Product | | | |

**Минимум для go-live:** все пункты раздела 1 + healthchecks + backup + CI green.
