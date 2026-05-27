import type { Metadata } from "next";
import { AdminBreadcrumbs, adminBreadcrumbItems } from "@/components/admin/admin-breadcrumbs";
import { AdminShell } from "@/components/layout/admin-shell";
import { AdminPracticalTaskForm } from "@/components/admin/admin-practical-task-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { prisma } from "@/lib/db";
import {
  adminModuleEditHref,
  resolveAdminModulePreset,
} from "@/lib/admin-module-preset";
import type { BreadcrumbItem } from "@/components/ui/breadcrumbs";

export const metadata: Metadata = {
  title: "Новая практика",
};

type Props = { searchParams: Promise<{ moduleId?: string }> };

function truncateTitle(title: string, max = 32): string {
  const t = title.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

export default async function AdminNewPracticalTaskPage({ searchParams }: Props) {
  const { moduleId: moduleIdQuery } = await searchParams;

  const modules = await prisma.module.findMany({
    orderBy: { orderNumber: "asc" },
    select: { id: true, title: true, orderNumber: true },
  });

  const presetModuleId = resolveAdminModulePreset(modules, moduleIdQuery);
  const presetModule = presetModuleId
    ? modules.find((m) => m.id === presetModuleId) ?? null
    : null;

  const breadcrumbItems: BreadcrumbItem[] = presetModule
    ? [
        { href: "/admin", label: "Админка" },
        { href: "/admin/modules", label: "Модули" },
        { href: adminModuleEditHref(presetModule.id), label: truncateTitle(presetModule.title) },
        { label: "Новая практика" },
      ]
    : adminBreadcrumbItems("Новая практика", { href: "/admin/practical-tasks", label: "Практика" });

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          title="Новое практическое задание"
          description={
            presetModule
              ? `Задание будет привязано к модулю «${presetModule.title}». Выберите тип — отобразятся нужные поля.`
              : "Выберите тип — отобразятся нужные поля. После сохранения можно снова открыть карточку и уточнить параметры."
          }
          breadcrumb={<AdminBreadcrumbs items={breadcrumbItems} />}
        />
        <div className="pb-24">
          {modules.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нет модулей — сначала создайте модуль курса.</p>
          ) : (
            <AdminPracticalTaskForm
              modules={modules}
              defaultModuleId={presetModuleId}
              cancelHref={presetModuleId ? adminModuleEditHref(presetModuleId) : "/admin/practical-tasks"}
            />
          )}
        </div>
      </div>
    </AdminShell>
  );
}
