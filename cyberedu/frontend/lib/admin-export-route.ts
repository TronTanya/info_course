import { NextResponse } from "next/server";
import { adminExportFilename } from "@/lib/admin-export-types";
import { buildAdminExportPayload } from "@/lib/admin-export-data";
import type { AdminExportType } from "@/lib/admin-export-types";
import { SECURITY_ACTIONS } from "@/lib/security/audit-actions";
import { logAdminSecurityEvent } from "@/lib/security/audit";
import type { ApiGuardContext } from "@/lib/security/api-guard";

export function adminCsvExportResponse(
  ctx: ApiGuardContext,
  exportType: AdminExportType,
): Promise<Response> {
  return buildAdminExportPayload(exportType).then(({ csv, rowCount }) => {
    const exportedAt = new Date().toISOString();
    const day = exportedAt.slice(0, 10);
    const filename = adminExportFilename(exportType, day);

    logAdminSecurityEvent(
      ctx.session.user.id,
      SECURITY_ACTIONS.ADMIN_CSV_EXPORT,
      null,
      { exportType, rowCount, format: "csv" },
      { ip: ctx.ip, path: new URL(ctx.req.url).pathname },
    );

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
        "X-Export-Type": exportType,
        "X-Export-Row-Count": String(rowCount),
        "X-Export-At": exportedAt,
      },
    });
  });
}
