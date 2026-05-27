import type { Metadata } from "next";
import Link from "next/link";
import { AdminBreadcrumbs, adminBreadcrumbItems } from "@/components/admin/admin-breadcrumbs";
import { AdminLmsDashboard } from "@/components/admin/admin-lms-dashboard";
import { AdminDashboardChartsLazy } from "@/components/admin/admin-dashboard-charts-lazy";
import { AdminDashboardQuickActions } from "@/components/admin/admin-dashboard-panels";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminShell } from "@/components/layout/admin-shell";
import { getAdminDashboardChartsData } from "@/lib/admin-dashboard-charts";
import { getAdminLmsDashboardData } from "@/lib/admin-lms-dashboard";
import { getAdminUserListRows } from "@/lib/admin-users-list";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Админка · LMS",
  description: "Панель управления CyberEdu: студенты, практика, сертификаты, аудит.",
};

export default async function AdminHomePage() {
  const [lms, users, charts] = await Promise.all([
    getAdminLmsDashboardData(),
    getAdminUserListRows(),
    getAdminDashboardChartsData(),
  ]);

  return (
    <AdminShell>
      <div className="space-y-8">
        <AdminPageHeader
          breadcrumb={<AdminBreadcrumbs items={adminBreadcrumbItems("Обзор")} />}
          eyebrow="Панель LMS"
          title="Панель управления"
          description="Обзор обучения, очередь проверки, сертификаты и события безопасности. Доступ только для администраторов."
          meta={
            <>
              <Badge variant="secondary">Доступ администратора</Badge>
              {lms.overview.pendingSubmissions > 0 ? (
                <Link
                  href="/admin/submissions?filter=pending"
                  className="inline-flex rounded-full focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Badge variant="warning" className="cursor-pointer hover:opacity-90">
                    {lms.overview.pendingSubmissions} на проверке
                  </Badge>
                </Link>
              ) : (
                <Badge variant="success">Очередь пуста</Badge>
              )}
            </>
          }
        />

        <AdminLmsDashboard data={lms} users={users} />

        <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,22rem)]">
          <AdminDashboardChartsLazy data={charts} />
          <AdminDashboardQuickActions />
        </div>
      </div>
    </AdminShell>
  );
}
