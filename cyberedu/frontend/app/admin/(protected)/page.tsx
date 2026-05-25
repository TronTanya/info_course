import { AdminControlCenter } from "@/components/admin/admin-control-center";
import { AdminDashboardChartsLazy } from "@/components/admin/admin-dashboard-charts-lazy";
import { AdminShell } from "@/components/layout/admin-shell";
import { ensureAdminPageAccess } from "@/lib/admin-page-guard";
import { getAdminControlCenterData } from "@/lib/admin-control-center";
import { getAdminDashboardChartsData } from "@/lib/admin-dashboard-charts";
import { getAdminUserListRows } from "@/lib/admin-users-list";
import { getCertificatesAdminPanelData } from "@/lib/certificates-admin-panel";

export { adminDashboardMetadata as metadata } from "@/lib/admin-metadata";

export default async function AdminHomePage() {
  await ensureAdminPageAccess();
  const [center, users, charts, certificatesPanel] = await Promise.all([
    getAdminControlCenterData(),
    getAdminUserListRows(),
    getAdminDashboardChartsData(),
    getCertificatesAdminPanelData(),
  ]);

  return (
    <AdminShell>
      <div className="space-y-8">
        <AdminControlCenter data={center} users={users} certificatesPanel={certificatesPanel} />
        <AdminDashboardChartsLazy data={charts} />
      </div>
    </AdminShell>
  );
}
