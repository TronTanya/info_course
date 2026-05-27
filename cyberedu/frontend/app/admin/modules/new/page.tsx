import type { Metadata } from "next";
import { AdminBreadcrumbs, adminBreadcrumbItems } from "@/components/admin/admin-breadcrumbs";
import { AdminShell } from "@/components/layout/admin-shell";
import { AdminModuleCreateForm } from "@/components/admin/admin-module-create-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export const metadata: Metadata = {
  title: "Новый модуль",
};

export default async function AdminNewModulePage() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          title="Новый модуль"
          description="Модуль будет добавлен в конец курса. Порядок можно изменить в списке модулей или при редактировании."
          breadcrumb={
            <AdminBreadcrumbs items={adminBreadcrumbItems("Новый модуль", { href: "/admin/modules", label: "Модули" })} />
          }
        />
        <div className="pb-24">
          <AdminModuleCreateForm />
        </div>
      </div>
    </AdminShell>
  );
}
