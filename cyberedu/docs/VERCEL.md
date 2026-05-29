# Деплой на Vercel

Ошибка **404 NOT_FOUND** (белая страница Vercel с `Code: NOT_FOUND`) — это **не** маршрут приложения, а отсутствие успешного деплоя или неверная настройка проекта.

Сообщение **`[Vercel] Укажите Root Directory: cyberedu/frontend`** — сборка запущена из корня репозитория без Next.js. Исправление ниже (вариант A или B).

## Обязательные настройки проекта

| Параметр | Значение |
|----------|----------|
| **Root Directory** | `cyberedu/frontend` **или** корень репо (см. вариант B) |
| **Framework** | Next.js |
| **Node.js Version** | **20.x** (не 24.x; в репо есть `.nvmrc` → `20`) |
| **Build Command** | `npm run build` (по умолчанию) |
| **Install Command** | `npm install` (или `npm ci`, если lock-файл закоммичен) |

### Вариант A (рекомендуется в UI)

**Project → Settings → General → Root Directory** → `cyberedu/frontend` → Save.

**Node.js Version** → **20.x**.

### Вариант B (корень репозитория)

В корне есть [`vercel.json`](../../vercel.json) и [`package.json`](../../package.json): install/build идут в `cyberedu/frontend`. Root Directory можно оставить пустым (`.`). После push сделайте **Redeploy**.

Шаблон переменных для Vercel: [`cyberedu/frontend/.env.vercel.example`](../frontend/.env.vercel.example).

## Переменные окружения (Production)

| Переменная | Пример |
|------------|--------|
| `DATABASE_URL` | Supabase transaction pooler `:6543?pgbouncer=true&connection_limit=1` (serverless) |
| `DIRECT_URL` | Supabase session pooler `:5432` (для `prisma migrate deploy` в CI, опционально) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` (если используете Storage / Data API) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` из Dashboard |
| `AUTH_SECRET` | ≥32 случайных символов |
| `AUTH_URL` | `https://ваш-домен.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | тот же URL |
| `NEXTAUTH_URL` | тот же URL |
| `NEXTAUTH_SECRET` | тот же, что `AUTH_SECRET` |
| `ENVIRONMENT` | `production` |
| `TRUSTED_PROXY` | `1` (на Vercel опционально — включается автоматически) |
| `REDIS_URL` | опционально (Upstash/Vercel KV); без Redis на Vercel вход работает через in-memory fallback |

Без `AUTH_URL` на Vercel приложение подставит origin из `VERCEL_URL` / `VERCEL_PROJECT_PRODUCTION_URL` при старте.

**Критично:** без `DATABASE_URL` и `AUTH_SECRET` вход и страницы с БД не работают.

Без внешнего Postgres (Neon, **Supabase**, Railway) приложение **соберётся**, но страницы с БД не заработают. Подробнее: [SUPABASE.md](./SUPABASE.md).

Опционально: `REDIS_URL` (rate limit / idempotency), `OPENAI_API_KEY` (AI).

## Ошибка `npm ci` / Missing from lock file

Если сборка падает на `Missing: @supabase/storage-js … from lock file`:

1. Закоммитьте актуальный `cyberedu/frontend/package-lock.json` с вашего ПК (после `npm install` в `cyberedu/frontend`).
2. Либо в Vercel оставьте **Install Command** = `npm install` (уже в `vercel.json`).

После синхронизации lock-файла можно снова перейти на `npm ci` для более быстрых сборок.

## После push

1. **Deployments** → последний деплой → статус **Ready** (не Error).
2. Открывайте URL из карточки **Visit** у успешного деплоя, не старый preview.

Конфиг сборки: корневой [`vercel.json`](../../vercel.json) и [`cyberedu/frontend/vercel.json`](../frontend/vercel.json) (placeholder env на build).

## Локальная проверка (Windows)

```powershell
cd cyberedu\frontend\scripts
.\dev.ps1
```

Или после перезапуска PowerShell:

```bash
cd cyberedu/frontend && npm ci && npm run build
```

См. также [DEPLOYMENT.md](./DEPLOYMENT.md) (основной прод — Docker/VPS).
