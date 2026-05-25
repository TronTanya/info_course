import type { Metadata } from "next";
import { AdminBreadcrumbs, adminBreadcrumbItems } from "@/components/admin/admin-breadcrumbs";
import { AdminExportPanel } from "@/components/admin/admin-export-panel";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTableCard } from "@/components/admin/admin-table-card";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { AdminShell } from "@/components/layout/admin-shell";
import { ensureAdminPageAccess } from "@/lib/admin-page-guard";
import { getAdminUserListRows } from "@/lib/admin-users-list";
export const metadata: Metadata = {
  title: "Пользователи",
};

export default async function AdminUsersPage() {
  await ensureAdminPageAccess();
  const rows = await getAdminUserListRows();

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          breadcrumb={<AdminBreadcrumbs items={adminBreadcrumbItems("Пользователи")} />}
          title="Пользователи"
          description="Учётные записи платформы. Поиск и фильтр по роли — в панели таблицы. CSV — в блоке экспорта ниже."
        />

        <AdminExportPanel />

        <AdminTableCard
          title="Список пользователей"
          description={`${rows.length} записей в базе`}
        >
          <AdminUsersTable rows={rows} />
        </AdminTableCard>
      </div>
    </AdminShell>
  );
}
