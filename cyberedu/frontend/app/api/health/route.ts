import { NextResponse } from "next/server";
import { readinessStatus, runReadinessChecks } from "@/lib/health/readiness";
import { withPublicApiRoute } from "@/lib/security/api-guard";

/** @public Liveness/readiness — без авторизации. */
export const GET = withPublicApiRoute({}, async () => {
  const checks = await runReadinessChecks();
  const status = readinessStatus(checks);
  const httpStatus = status === "ok" ? 200 : 503;

  return NextResponse.json(
    {
      status,
      service: "cyberedu-frontend",
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: httpStatus, headers: { "Cache-Control": "no-store" } },
  );
});
