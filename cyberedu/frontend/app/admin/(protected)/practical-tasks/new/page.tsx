import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { AdminPracticalTaskForm } from "@/components/admin/admin-practical-task-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ensureAdminPageAccess } from "@/lib/admin-page-guard";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Новая практика",
};

export default async function AdminNewPracticalTaskPage() {
  await ensureAdminPageAccess();
  const modules = await prisma.module.findMany({
    orderBy: { orderNumber: "asc" },
    select: { id: true, title: true, orderNumber: true },
  });

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          title="Новое практическое задание"
          description="Выберите тип — отобразятся нужные поля. После сохранения можно снова открыть карточку и уточнить параметры."
          breadcrumb={
            <Link href="/admin/practical-tasks" className="hover:text-foreground">
              ← Практика
            </Link>
          }
        />
        <div>
          {modules.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нет модулей — сначала создайте модуль курса.</p>
          ) : (
            <AdminPracticalTaskForm modules={modules} />
          )}
        </div>
      </div>
    </AdminShell>
  );
}
