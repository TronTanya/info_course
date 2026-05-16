# RELEASE CHECKLIST

Чеклист для выпуска версии `vX.Y.Z` (git tag → GHCR → VPS).

## Pre-release (T-7 … T-1)

- [ ] Все PR в `main` смержены; CI green
- [ ] Версия и scope релиза согласованы (features / fixes / breaking)
- [ ] Миграции Prisma review: destructive changes? downtime?
- [ ] Обновлены `docs/API.md` при изменении контрактов
- [ ] Security checklist (критичные пункты) пройден
- [ ] Staging: полный user journey (register → course → test → practice → certificate)
- [ ] Регрессия admin: users export, submission review, content edit

## Build & publish

- [ ] Создать annotated tag: `git tag -a vX.Y.Z -m "Release vX.Y.Z"`
- [ ] `git push origin vX.Y.Z`
- [ ] Дождаться GitHub Actions **Release (GHCR)** — образы `cyberedu-frontend`, `cyberedu-frontend-migrate`, `cyberedu-backend`
- [ ] Проверить digest образов в GHCR

## Deploy (VPS)

- [ ] Уведомить пользователей о maintenance window (если нужно)
- [ ] **Backup БД:** `pg_dump` → secure storage
- [ ] `git pull` на сервере (или deploy артефактов)
- [ ] Обновить `.env.production` при новых переменных
- [ ] `docker compose -f docker-compose.prod.yml --env-file .env.production pull` (если GHCR)
- [ ] `docker compose ... build` (если build on server)
- [ ] `docker compose ... up -d` — дождаться `frontend-migrate` completed
- [ ] Smoke tests post-deploy (см. ниже)

## Post-release smoke (5–10 min)

- [ ] `curl -fsS https://<domain>/nginx-health`
- [ ] `curl -fsS https://<domain>/api/health`
- [ ] `curl -fsS https://<domain>/api/v1/health` (с `X-API-Key` если с хоста internal)
- [ ] Login student + admin
- [ ] Открыть урок, AI chat (если ключ задан)
- [ ] Скачать сертификат (test user с completed course)

## Rollback

- [ ] Зафиксировать причину инцидента
- [ ] `docker compose ... up -d` с предыдущими image tags
- [ ] При failed migration — restore DB из backup, **не** amend migration history на prod

## Communication

- [ ] Release notes в GitHub Releases
- [ ] Внутренняя рассылка: что изменилось для преподавателей/админов

## Post-release (T+1)

- [ ] Мониторинг ошибок 24h
- [ ] Проверить disk usage uploads volume
- [ ] Закрыть релизный milestone
