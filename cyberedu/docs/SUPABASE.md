# Supabase

Проект использует **Supabase Postgres** как хост БД (через Prisma) и **Supabase JS** для Storage / Realtime / Data API. **Auth остаётся на NextAuth** — не подключайте Supabase Auth параллельно без отдельного плана миграции.

## 1. Проект в Supabase

1. [database.new](https://database.new) → создайте проект.
2. **Settings → API**: скопируйте **Project URL** и **publishable** key (`sb_publishable_…` или legacy `anon`).
3. **Connect → ORMs → Prisma**: возьмите строки **Transaction** (порт `6543`) и **Session** (порт `5432`).

Рекомендуется отдельный пользователь `prisma` с `bypassrls` для миграций — см. [Prisma + Supabase](https://supabase.com/docs/guides/database/prisma).

## 2. Переменные окружения

В `cyberedu/frontend/.env` (и в Vercel → Environment Variables):

```env
# Supabase API (клиент @/lib/supabase/*)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...

# Prisma → Postgres на Supabase
# Transaction pooler (приложение, serverless)
DATABASE_URL="postgresql://prisma.[ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
# Session / direct (prisma migrate deploy)
DIRECT_URL="postgresql://prisma.[ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
```

Локально с Docker Postgres `DIRECT_URL` можно не задавать — продублируйте `DATABASE_URL` или оставьте только локальный `DATABASE_URL` из `.env.example`.

**Не коммитьте** service role / `sb_secret_` в репозиторий и не используйте `NEXT_PUBLIC_` для секретов.

## 3. Миграции Prisma на Supabase

```bash
cd cyberedu/frontend
export DATABASE_URL="..."   # transaction + ?pgbouncer=true
export DIRECT_URL="..."     # session :5432
npx prisma migrate deploy
npx prisma db seed   # только dev, RUN_SEED=1
```

## 4. Код

| Импорт | Назначение |
|--------|------------|
| `@/lib/supabase/client` | Client Components |
| `@/lib/supabase/server` | Server Components / API routes |
| `@/lib/db` (Prisma) | Основные таблицы, NextAuth |

Пример (Data API):

```ts
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();
const { data, error } = await supabase.from("my_table").select();
```

## 5. MCP в Cursor

В корне репозитория: [`.mcp.json`](../../.mcp.json) и [`.cursor/mcp.json`](../../.cursor/mcp.json) → `https://mcp.supabase.com/mcp?project_ref=vxihebmodvatwmiasvzp&read_only=true`.

1. **Cursor → Settings → Tools & MCP** — включите сервер `supabase`.
2. Пройдите OAuth в браузере (организация с нужным проектом).
3. При смене проекта обновите `project_ref` в обоих файлах; `read_only=true` ограничивает SQL только чтением.

Плагин Supabase в `.cursor/settings.json` уже включён.

## 6. Vercel

См. [VERCEL.md](./VERCEL.md): `DATABASE_URL` = Supabase transaction pooler, плюс `DIRECT_URL` для build-time migrate (если вызываете migrate в CI).

## 7. Storage (опционально)

Для загрузок вместо локального `UPLOADS_DIR` можно позже перейти на Supabase Storage — клиент уже доступен; политики RLS на bucket настраиваются в Dashboard.
