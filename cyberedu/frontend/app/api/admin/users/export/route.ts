import { NextResponse } from "next/server";
import { adminUsersToCsv } from "@/lib/admin-users-csv";
import { getAdminUserListRows } from "@/lib/admin-users-list";
import { securityAudit } from "@/lib/security/audit";
import { withApiGuard } from "@/lib/security/api-guard";

export const GET = withApiGuard(
  {
    auth: "admin",
    permission: "admin:export",
    rateLimit: { name: "admin:export", ipMax: 20, userMax: 10, windowMs: 60 * 60 * 1000 },
  },
  async ({ session, ip, req }) => {
    const rows = await getAdminUserListRows();
    const csv = adminUsersToCsv(rows);
    const day = new Date().toISOString().slice(0, 10);
    const filename = `cyberedu-users-${day}.csv`;

    securityAudit({
      event: "admin.users_export",
      severity: "info",
      actorId: session?.user?.id,
      ip,
      path: new URL(req.url).pathname,
      meta: { rowCount: rows.length },
    });

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
