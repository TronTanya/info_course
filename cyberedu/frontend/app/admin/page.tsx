import type { Metadata } from "next";
import { AdminDashboardChartsLazy } from "@/components/admin/admin-dashboard-charts-lazy";
import {
  AdminDashboardContentOverview,
  AdminDashboardKpiGrid,
  AdminDashboardQuickActions,
  AdminDashboardRecentActivity,
  AdminDashboardSystemStatus,
} from "@/components/admin/admin-dashboard-panels";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminShell } from "@/components/layout/admin-shell";
import { getAdminDashboardChartsData } from "@/lib/admin-dashboard-charts";
import { getAdminDashboardExtended, getAdminDashboardStats } from "@/lib/admin-dashboard";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Админка · Обзор",
};

export default async function AdminHomePage() {
  const [stats, extended, charts] = await Promise.all([
    getAdminDashboardStats(),
    getAdminDashboardExtended(),
    getAdminDashboardChartsData(),
  ]);

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="CyberEdu · админ"
          title="Панель администратора"
          description="Управление курсом, пользователями, проверкой практики и отчётами. Доступ только для роли ADMIN."
          meta={
            <>
              <Badge variant={extended.systemOk ? "success" : "danger"}>
                {extended.systemOk ? "Система готова" : "Требуется настройка курса"}
              </Badge>
              {stats.pendingWorkCount > 0 ? (
                <Badge variant="warning">{stats.pendingWorkCount} на проверке</Badge>
              ) : null}
            </>
          }
        />

        <AdminDashboardKpiGrid stats={stats} />

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <AdminDashboardQuickActions />
            <AdminDashboardChartsLazy data={charts} />
          </div>
          <div className="space-y-6">
            <AdminDashboardSystemStatus systemOk={extended.systemOk} pendingWork={stats.pendingWorkCount} />
            <AdminDashboardContentOverview content={extended.content} />
            <AdminDashboardRecentActivity recent={extended.recent} />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
