import { NextResponse } from "next/server";
import { parseAdminExportType } from "@/lib/admin-export-types";
import { adminCsvExportResponse } from "@/lib/admin-export-route";
import { withApiGuard } from "@/lib/security/api-guard";

export const GET = withApiGuard(
  {
    requireAdmin: true,
    permission: "admin:export",
    rateLimit: "adminExport",
  },
  async (ctx) => {
    const type = parseAdminExportType(new URL(ctx.req.url).searchParams.get("type"));
    if (!type) {
      return NextResponse.json(
        { error: "Укажите type: students, progress, submissions или certificates." },
        { status: 400 },
      );
    }
    return adminCsvExportResponse(ctx, type);
  },
);
