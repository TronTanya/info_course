import type { Metadata } from "next";
import { AdminBreadcrumbs, adminBreadcrumbItems } from "@/components/admin/admin-breadcrumbs";
import { AdminShell } from "@/components/layout/admin-shell";
import { AdminTestCreateForm } from "@/components/admin/admin-test-create-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  adminModuleEditHref,
  resolveAdminModulePreset,
} from "@/lib/admin-module-preset";
import type { BreadcrumbItem } from "@/components/ui/breadcrumbs";

export const metadata: Metadata = {
  title: "Новый тест",
};

type Props = { searchParams: Promise<{ moduleId?: string }> };

function truncateTitle(title: string, max = 32): string {
  const t = title.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

export default async function AdminNewTestPage({ searchParams }: Props) {
  const { moduleId: moduleIdQuery } = await searchParams;

  const modules = await prisma.module.findMany({
    orderBy: { orderNumber: "asc" },
    select: { id: true, title: true, orderNumber: true },
  });

  const presetModuleId = resolveAdminModulePreset(modules, moduleIdQuery);
  const presetModule = presetModuleId
    ? modules.find((m) => m.id === presetModuleId) ?? null
    : null;

  const existingTestForModule = presetModuleId
    ? await prisma.test.findFirst({
        where: { moduleId: presetModuleId },
        orderBy: { createdAt: "asc" },
        select: { id: true, title: true },
      })
    : null;

  const breadcrumbItems: BreadcrumbItem[] = presetModule
    ? [
        { href: "/admin", label: "Админка" },
        { href: "/admin/modules", label: "Модули" },
        { href: adminModuleEditHref(presetModule.id), label: truncateTitle(presetModule.title) },
        { label: "Новый тест" },
      ]
    : adminBreadcrumbItems("Новый тест", { href: "/admin/tests", label: "Тесты" });

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          title="Новый тест"
          description={
            presetModule
              ? `Тест будет привязан к модулю «${presetModule.title}». После создания добавьте вопросы и варианты ответов.`
              : "Тест привязывается к модулю. После создания добавьте вопросы и варианты ответов."
          }
          breadcrumb={<AdminBreadcrumbs items={breadcrumbItems} />}
        />
        <div className="pb-24 space-y-6">
          {existingTestForModule ? (
            <Alert variant="warning" title="В модуле уже есть тест">
              «{existingTestForModule.title}» — можно отредактировать существующий или создать ещё один для того же
              модуля.
              <div className="mt-3">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/tests/${existingTestForModule.id}/edit`}>Открыть тест</Link>
                </Button>
              </div>
            </Alert>
          ) : null}
          {modules.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нет модулей — сначала создайте модуль курса.</p>
          ) : (
            <AdminTestCreateForm
              modules={modules}
              defaultModuleId={presetModuleId}
              cancelHref={presetModuleId ? adminModuleEditHref(presetModuleId) : "/admin/tests"}
            />
          )}
        </div>
      </div>
    </AdminShell>
  );
}
