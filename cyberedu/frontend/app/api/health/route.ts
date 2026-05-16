import { NextResponse } from "next/server";
import { withPublicApiRoute } from "@/lib/security/api-guard";

/** @public Liveness/readiness — без авторизации. */
export const GET = withPublicApiRoute({}, async () => {
  return NextResponse.json(
    {
      status: "ok",
      service: "cyberedu-frontend",
      timestamp: new Date().toISOString(),
    },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
});
