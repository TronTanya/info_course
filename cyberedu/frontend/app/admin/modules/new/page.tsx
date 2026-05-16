import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { AdminModuleCreateForm } from "@/components/admin/admin-module-create-form";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Новый модуль",
};

export default async function AdminNewModulePage() {
  return (
    <AdminShell>
      <PageHeader
        title="Новый модуль"
        description="Модуль будет добавлен в конец курса. Порядок можно изменить в списке модулей или при редактировании."
        breadcrumb={
          <Link href="/admin/modules" className="hover:text-foreground">
            ← Модули
          </Link>
        }
      />
      <div className="mt-8">
        <AdminModuleCreateForm />
      </div>
    </AdminShell>
  );
}
