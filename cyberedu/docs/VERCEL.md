# Деплой на Vercel

Ошибка **404 NOT_FOUND** (белая страница Vercel с `Code: NOT_FOUND`) — это **не** маршрут приложения, а отсутствие успешного деплоя или неверная настройка проекта.

## Обязательные настройки проекта

| Параметр | Значение |
|----------|----------|
| **Root Directory** | `cyberedu/frontend` |
| **Framework** | Next.js |
| **Node.js Version** | **20.x** (не 24.x) |
| **Build Command** | `npm run build` (по умолчанию) |
| **Install Command** | `npm ci` |

Root Directory: **Project → Settings → General → Root Directory**.

Node.js: **Project → Settings → General → Node.js Version → 20.x**.

## Переменные окружения (Production)

| Переменная | Пример |
|------------|--------|
| `DATABASE_URL` | Supabase transaction pooler `:6543?pgbouncer=true` или Neon/Railway |
| `DIRECT_URL` | Supabase session pooler `:5432` (для `prisma migrate` на build) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` (если используете Storage / Data API) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` из Dashboard |
| `AUTH_SECRET` | ≥32 случайных символов |
| `AUTH_URL` | `https://ваш-домен.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | тот же URL |
| `NEXTAUTH_URL` | тот же URL |
| `NEXTAUTH_SECRET` | тот же, что `AUTH_SECRET` |
| `ENVIRONMENT` | `production` |

Без внешнего Postgres (Neon, **Supabase**, Railway) приложение **соберётся**, но страницы с БД не заработают. Подробнее: [SUPABASE.md](./SUPABASE.md).

Опционально: `REDIS_URL` (rate limit / idempotency), `OPENAI_API_KEY` (AI).

## После push

1. **Deployments** → последний деплой → статус **Ready** (не Error).
2. Открывайте URL из карточки **Visit** у успешного деплоя, не старый preview.

В корне репозитория **нет** `vercel.json` — конфиг только в `cyberedu/frontend/vercel.json`. Без Root Directory Vercel снова покажет 404.

## Локальная проверка

```bash
cd cyberedu/frontend && npm ci && npm run build
```

См. также [DEPLOYMENT.md](./DEPLOYMENT.md) (основной прод — Docker/VPS).
