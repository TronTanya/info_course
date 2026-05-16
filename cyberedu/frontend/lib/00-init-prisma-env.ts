/**
 * Имя файла с префиксом `00-`, чтобы при сборке/трансформации импорт шёл раньше `@prisma/client`.
 * Prisma принимает только `postgresql://` / `postgres://`; SQLAlchemy — `postgresql+psycopg://`.
 */
const raw = process.env.DATABASE_URL?.trim();
if (raw) {
  const drivers: { prefix: string; replacement: string }[] = [
    { prefix: "postgresql+psycopg://", replacement: "postgresql://" },
    { prefix: "postgres+psycopg://", replacement: "postgres://" },
    { prefix: "postgresql+psycopg2://", replacement: "postgresql://" },
    { prefix: "postgres+psycopg2://", replacement: "postgres://" },
  ];
  for (const { prefix, replacement } of drivers) {
    if (raw.startsWith(prefix)) {
      process.env.DATABASE_URL = replacement + raw.slice(prefix.length);
      break;
    }
  }
}

export {};
