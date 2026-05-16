# CyberEdu — production deployment (VPS)

> **Canonical doc:** [`../docs/DEPLOYMENT.md`](../docs/DEPLOYMENT.md) · **Checklist:** [`../docs/checklists/DEPLOYMENT_CHECKLIST.md`](../docs/checklists/DEPLOYMENT_CHECKLIST.md)

Руководство для развёртывания на VPS (Ubuntu 22.04/24.04) с **`docker-compose.prod.yml`**, Nginx и SSL.

- Секреты: **только** `.env.production` + `--env-file` (не Docker build-args).
- Postgres, Redis, backend **не** публикуются на хост; pgAdmin **нет**; seed **не** запускается (`RUN_SEED=0`).

## Архитектура

```
Internet → Nginx (:80/:443)
              ├─ /        → frontend:3000 (Next.js)
              └─ /api/v1/ → backend:8000 (FastAPI)
           postgres, redis (internal network only)
```

- **Миграции БД:** one-shot сервис `frontend-migrate` перед стартом `frontend`.
- **Секреты:** файл `.env.production` на сервере (не в git).
- **Логи:** Docker `json-file` (ротация 20m × 5 файлов).
- **Мониторинг:** профиль `monitoring` → Prometheus на `127.0.0.1:9090`.

## Требования VPS

| Ресурс | Минимум |
|--------|---------|
| CPU | 2 vCPU |
| RAM | 4 GB |
| Disk | 40 GB SSD |
| ОС | Linux + Docker 24+ и Compose v2 |

```bash
# Ubuntu
sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
sudo usermod -aG docker "$USER"
```

## 1. Клонирование и конфигурация

```bash
git clone https://github.com/TronTanya/info_course.git
cd info_course/cyberedu

cp .env.production.example .env.production
chmod 600 .env.production
nano .env.production   # задайте домен, пароли, AUTH_SECRET, INTERNAL_API_KEY
```

Сгенерируйте секреты:

```bash
openssl rand -base64 32   # AUTH_SECRET, JWT_SECRET_KEY
openssl rand -hex 32      # INTERNAL_API_KEY
openssl rand -base64 24   # POSTGRES_PASSWORD, REDIS_PASSWORD
```

Обязательно задайте:

- `AUTH_URL` / `NEXT_PUBLIC_APP_URL` — ваш HTTPS-домен
- `NEXT_PUBLIC_API_URL` — тот же домен (API через Nginx `/api/v1/`)
- `CORS_ORIGINS` — тот же домен
- `POSTGRES_PASSWORD`, `REDIS_PASSWORD`, `INTERNAL_API_KEY`

## 2. Запуск

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

Или скрипт:

```bash
chmod +x deploy/scripts/vps-deploy.sh
./deploy/scripts/vps-deploy.sh
```

Проверка:

```bash
curl -sS http://127.0.0.1/nginx-health
curl -sS http://127.0.0.1/api/v1/health
curl -sS http://127.0.0.1/api/health
```

## 3. SSL (Let's Encrypt)

1. Убедитесь, что DNS указывает на VPS.
2. Первый запуск на HTTP (порт 80 открыт).
3. Certbot webroot:

```bash
sudo mkdir -p /var/www/certbot
docker run --rm -v "$(pwd)/deploy/nginx/certs:/etc/letsencrypt" \
  -v /var/www/certbot:/var/www/certbot \
  certbot/certbot certonly --webroot -w /var/www/certbot \
  -d your-domain.example --agree-tos -m admin@example.com --no-eff-email
```

4. Скопируйте `deploy/nginx/conf.d/cyberedu.ssl.conf.example` → `cyberedu.ssl.conf`, подставьте домен.
5. `docker compose ... restart nginx`

## 4. CI/CD (GitHub Actions)

| Workflow | Назначение |
|----------|------------|
| `.github/workflows/ci.yml` | lint, typecheck, tests, compose validate, docker build |
| `.github/workflows/release.yml` | push образов в GHCR при теге `v*.*.*` |

На VPS с GHCR:

```bash
# .env.production
FRONTEND_IMAGE=ghcr.io/TronTanya/cyberedu-frontend:latest
# override build в compose через image: (см. документацию compose)
```

## 5. Секреты

| Способ | Когда |
|--------|--------|
| `.env.production` | VPS single-node (chmod 600) |
| Docker secrets | Swarm / orchestrators |
| GitHub Secrets | CI и release workflow |

Никогда не коммитьте `.env.production`, ключи OpenAI, пароли БД.

## 6. Мониторинг и логи

**Логи приложений:**

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f frontend backend nginx
```

**Prometheus (опционально):**

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production --profile monitoring up -d
# SSH tunnel: ssh -L 9090:127.0.0.1:9090 user@vps
```

Рекомендуется внешний uptime (Uptime Kuma, Better Stack) на `https://your-domain/api/health`.

## 7. Обновление релиза

```bash
git pull
docker compose -f docker-compose.prod.yml --env-file .env.production build
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

Миграции применяются автоматически через `frontend-migrate`.

## 8. Dev vs Production

| | Development | Production |
|---|-------------|------------|
| Compose | `docker-compose.yml` | `docker-compose.prod.yml` |
| Порты БД | 15432 наружу | только internal |
| pgAdmin | да | нет |
| Seed | `RUN_SEED=1` | `RUN_SEED=0` |
| Nginx | нет | да |
| Redis | опционально | обязателен |

## 9. Troubleshooting

- **502 от Nginx:** `docker compose ... ps` — дождитесь `healthy` у frontend/backend.
- **JWT ошибки:** `AUTH_SECRET` одинаковый после перезапуска; cookie перелогин.
- **AI не работает:** задайте `OPENAI_API_KEY` в `.env.production`.
- **Миграции:** логи `docker compose ... logs frontend-migrate`.
