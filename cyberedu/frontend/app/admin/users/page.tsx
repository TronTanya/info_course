import type { Metadata } from "next";
import Link from "next/link";
import { AdminBreadcrumbs, adminBreadcrumbItems } from "@/components/admin/admin-breadcrumbs";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTableCard } from "@/components/admin/admin-table-card";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { AdminShell } from "@/components/layout/admin-shell";
import { getAdminUserListRows } from "@/lib/admin-users-list";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Пользователи",
};

export default async function AdminUsersPage() {
  const rows = await getAdminUserListRows();

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          breadcrumb={<AdminBreadcrumbs items={adminBreadcrumbItems("Пользователи")} />}
          title="Пользователи"
          description="Учётные записи платформы: прогресс по курсу, роль и последняя активность. Поиск и фильтр по роли — в панели таблицы."
          actions={
            <Button asChild variant="primary" className="w-full sm:w-auto">
              <a href="/api/admin/users/export">Скачать отчёт CSV</a>
            </Button>
          }
        />

        <AdminTableCard
          title="Список пользователей"
          description={`${rows.length} записей в базе`}
          headerActions={
            <Button asChild variant="outline" size="sm">
              <Link href="/api/admin/users/export">CSV</Link>
            </Button>
          }
        >
          <AdminUsersTable rows={rows} />
        </AdminTableCard>
      </div>
    </AdminShell>
  );
}
