# DEPLOYMENT CHECKLIST (VPS)

Краткий операционный чеклист. Подробности: [../DEPLOYMENT.md](../DEPLOYMENT.md).

## Подготовка сервера

- [ ] Ubuntu 22.04/24.04, 2+ vCPU, 4+ GB RAM, 40+ GB SSD
- [ ] Docker 24+ и Compose v2 установлены
- [ ] Firewall: 80, 443 open; 22 restricted (SSH keys)
- [ ] DNS A/AAAA на IP сервера
- [ ] SSH hardening (no password auth recommended)

## Конфигурация приложения

- [ ] `git clone` → `cd cyberedu`
- [ ] `cp .env.prod.example .env.production` + `chmod 600`
- [ ] Сгенерированы: `AUTH_SECRET`, `JWT_SECRET_KEY`, `INTERNAL_API_KEY`, DB/Redis passwords
- [ ] `AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_API_URL`, `CORS_ORIGINS` = production HTTPS
- [ ] `OPENAI_API_KEY` (если AI нужен в prod)
- [ ] `SHOW_SEED_LOGIN_HINT=0`

## Первый запуск

- [ ] `docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build`
- [ ] `docker compose ... ps` — все healthy
- [ ] `docker compose ... logs frontend-migrate` — success
- [ ] HTTP smoke: `/nginx-health`, `/api/health`

## SSL

- [ ] Certbot webroot или DNS challenge
- [ ] `cyberedu.ssl.conf` из example, paths к certs
- [ ] `docker compose ... restart nginx`
- [ ] HTTPS smoke + HSTS header present

## Post-deploy

- [ ] Uptime monitor configured
- [ ] Cron backup `pg_dump` (daily) + test restore quarterly
- [ ] Log rotation verified (`max-size` 20m × 5)
- [ ] Optional: `--profile monitoring` Prometheus (localhost only)

## Обновление

- [ ] Backup DB before upgrade
- [ ] Pull/build new images
- [ ] `up -d` — verify migrate job
- [ ] Post-release smoke (RELEASE_CHECKLIST)

## Откат

- [ ] Previous image tags documented
- [ ] `docker compose up -d` with old tags
- [ ] DB restore procedure if migration failed
