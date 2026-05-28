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
}

normalizePostgresUrl("DATABASE_URL");
normalizePostgresUrl("DIRECT_URL");

export {};
