/**
 * Выполняется при старте сервера Next (Node.js runtime, до обработки запросов).
 * Нормализует `DATABASE_URL` для Prisma (см. `lib/00-init-prisma-env.ts`).
 */
import "./lib/00-init-prisma-env";

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "edge") return;
  const { loadParentAiEnv } = await import("@/lib/load-parent-ai-env");
  loadParentAiEnv();
}
