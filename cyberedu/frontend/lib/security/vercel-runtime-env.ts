/** Vercel injects `VERCEL=1` at runtime on serverless and edge. */
export function isVercelRuntime(): boolean {
  return (process.env.VERCEL ?? "").trim() === "1";
}

function originFromHost(host: string): string | null {
  const trimmed = host.trim();
  if (!trimmed) return null;
  try {
    return (trimmed.startsWith("http") ? new URL(trimmed) : new URL(`https://${trimmed}`)).origin;
  } catch {
    return null;
  }
}

/**
 * Fill AUTH_* from Vercel-provided hostnames when env vars were not set in the dashboard.
 * Preview deployments use `VERCEL_URL`; production may expose `VERCEL_PROJECT_PRODUCTION_URL`.
 */
export function bootstrapVercelRuntimeEnv(): void {
  if (!isVercelRuntime()) return;

  const hasAuth =
    process.env.AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim();
  if (hasAuth) return;

  const origin =
    originFromHost(process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "") ??
    originFromHost(process.env.VERCEL_URL ?? "");
  if (!origin) return;

  process.env.AUTH_URL = origin;
  if (!process.env.NEXT_PUBLIC_APP_URL?.trim()) {
    process.env.NEXT_PUBLIC_APP_URL = origin;
  }
  if (!process.env.NEXTAUTH_URL?.trim()) {
    process.env.NEXTAUTH_URL = origin;
  }
}

export function resolveProductionAuthOrigin(): string | null {
  bootstrapVercelRuntimeEnv();
  const explicit =
    process.env.AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim();
  return explicit ? originFromHost(explicit) : null;
}
