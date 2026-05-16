import { NextResponse } from "next/server";
import { adminUsersToCsv } from "@/lib/admin-users-csv";
import { getAdminUserListRows } from "@/lib/admin-users-list";
import { SECURITY_ACTIONS } from "@/lib/security/audit-actions";
import { logAdminSecurityEvent } from "@/lib/security/audit";
import { withApiGuard } from "@/lib/security/api-guard";

export const GET = withApiGuard(
  {
    requireAdmin: true,
    permission: "admin:export",
    rateLimit: "adminExport",
  },
  async ({ session, ip, req }) => {
    const rows = await getAdminUserListRows();
    const csv = adminUsersToCsv(rows);
    const day = new Date().toISOString().slice(0, 10);
    const filename = `cyberedu-users-${day}.csv`;

    logAdminSecurityEvent(
      session.user.id,
      SECURITY_ACTIONS.ADMIN_USERS_CSV_EXPORT,
      null,
      { rowCount: rows.length, format: "csv" },
      { ip, path: new URL(req.url).pathname },
    );

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  },
);
