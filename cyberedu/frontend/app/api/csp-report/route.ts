import { NextResponse } from "next/server";
import { parseSanitizedCspReports } from "@/lib/security/csp-report";
import { SECURITY_ACTIONS } from "@/lib/security/audit-actions";
import { logSecurityEvent } from "@/lib/security/audit";
import { withPublicApiRoute, parseJsonBody } from "@/lib/security/api-guard";

const MAX_BODY_BYTES = 32_768;

/**
 * Приём CSP violation reports (Report-Only / enforce).
 * Публичный endpoint: без auth; rate limit по IP; в audit только санитизированные поля.
 */
export const POST = withPublicApiRoute(
  { rateLimit: "cspReport", skipBodyParse: true },
  async ({ req, ip }) => {
    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > MAX_BODY_BYTES) {
      return new NextResponse(null, { status: 413 });
    }

    const raw = await parseJsonBody(req);
    const reports = parseSanitizedCspReports(raw);
    if (reports.length === 0) {
      return new NextResponse(null, { status: 204 });
    }

    for (const report of reports) {
      logSecurityEvent({
        action: SECURITY_ACTIONS.SECURITY_CSP_REPORT,
        ip,
        path: "/api/csp-report",
        severity: "info",
        metadata: report,
      });
    }

    return new NextResponse(null, { status: 204 });
  },
);
