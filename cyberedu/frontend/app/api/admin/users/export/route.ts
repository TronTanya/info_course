import { adminCsvExportResponse } from "@/lib/admin-export-route";
import { withApiGuard } from "@/lib/security/api-guard";

/** @deprecated Предпочтительно `/api/admin/export?type=students`. */
export const GET = withApiGuard(
  {
    requireAdmin: true,
    permission: "admin:export",
    rateLimit: "adminExport",
  },
  async (ctx) => adminCsvExportResponse(ctx, "students"),
);
