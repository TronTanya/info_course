/**
 * Выполняется при старте сервера Next (до обработки запросов).
 * Нормализует `DATABASE_URL` для Prisma (см. `lib/00-init-prisma-env.ts`).
 */
import "./lib/00-init-prisma-env";

export function register(): void {}
