/**
 * Имя файла с префиксом `00-`, чтобы при сборке/трансформации импорт шёл раньше `@prisma/client`.
 * Prisma принимает только `postgresql://` / `postgres://`; SQLAlchemy — `postgresql+psycopg://`.
 */
const drivers: { prefix: string; replacement: string }[] = [
  { prefix: "postgresql+psycopg://", replacement: "postgresql://" },
  { prefix: "postgres+psycopg://", replacement: "postgres://" },
  { prefix: "postgresql+psycopg2://", replacement: "postgresql://" },
  { prefix: "postgres+psycopg2://", replacement: "postgres://" },
];

function normalizePostgresUrl(envKey: "DATABASE_URL" | "DIRECT_URL") {
  const raw = process.env[envKey]?.trim();
  if (!raw) return;
  for (const { prefix, replacement } of drivers) {
    if (raw.startsWith(prefix)) {
      process.env[envKey] = replacement + raw.slice(prefix.length);
      break;
    }
  }

  // pg v8+ treats sslmode=require as verify-full; Windows often lacks Supabase CA chain.
  // uselibpqcompat restores libpq semantics so Prisma connects without NODE_TLS_REJECT_UNAUTHORIZED=0.
  const url = process.env[envKey];
  if (
    url &&
    /sslmode=(require|prefer|verify-ca)/i.test(url) &&
    !/[?&]uselibpqcompat=/i.test(url)
  ) {
    process.env[envKey] = `${url}${url.includes("?") ? "&" : "?"}uselibpqcompat=true`;
  }
}

/** Локальный dev на Windows: без лимита Prisma открывает ~17 conn к Supabase pooler и падает по timeout. */
function ensureLocalDevPoolLimit(envKey: "DATABASE_URL") {
  if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") return;
  const url = process.env[envKey];
  if (!url || /connection_limit=/i.test(url)) return;
  process.env[envKey] = `${url}${url.includes("?") ? "&" : "?"}connection_limit=1&pool_timeout=20`;
}

normalizePostgresUrl("DATABASE_URL");
normalizePostgresUrl("DIRECT_URL");
ensureLocalDevPoolLimit("DATABASE_URL");

export {};
