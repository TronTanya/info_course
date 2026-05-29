/**
 * Выполняется при старте сервера Next (до обработки запросов).
 * Нормализует `DATABASE_URL` для Prisma (см. `lib/00-init-prisma-env.ts`).
 */
import "./lib/00-init-prisma-env";
import { isTrustedProxyEnabled } from "@/lib/security/request-ip";
import {
  bootstrapVercelRuntimeEnv,
  resolveProductionAuthOrigin,
} from "@/lib/security/vercel-runtime-env";

function isProductionRuntime(): boolean {
  const environment = (process.env.ENVIRONMENT ?? "").trim().toLowerCase();
  if (environment === "production" || environment === "prod") return true;
  if (environment === "development" || environment === "dev") return false;
  return process.env.NODE_ENV === "production";
}

function validateSecurityRuntimeEnv(): void {
  if (!isProductionRuntime()) return;
  bootstrapVercelRuntimeEnv();
  if (!resolveProductionAuthOrigin()) {
    throw new Error(
      "AUTH_URL or NEXT_PUBLIC_APP_URL must be configured in production for CSRF origin validation.",
    );
  }
  if (!isTrustedProxyEnabled()) {
    throw new Error(
      "TRUSTED_PROXY=1 is required in production behind a reverse proxy (client IP for rate limits and audit).",
    );
  }
}

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    validateSecurityRuntimeEnv();
    const { loadParentAiEnv } = await import("@/lib/load-parent-ai-env");
    loadParentAiEnv();
  }
}
