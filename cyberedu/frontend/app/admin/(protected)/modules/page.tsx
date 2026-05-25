import type { Metadata } from "next";
import Link from "next/link";
import { AdminDualTable } from "@/components/admin/admin-dual-table";
import { AdminModuleMoveButtons } from "@/components/admin/admin-module-move-buttons";
import { AdminBreadcrumbs, adminBreadcrumbItems } from "@/components/admin/admin-breadcrumbs";
import { AdminMobileCard } from "@/components/admin/admin-mobile-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable, AdminTableBody, AdminTableHead, AdminTh } from "@/components/admin/admin-table";
import { AdminTableCard } from "@/components/admin/admin-table-card";
import { AdminShell } from "@/components/layout/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UiStatePanel } from "@/components/ui/ui-state-panel";
import { ensureAdminPageAccess } from "@/lib/admin-page-guard";
import { prisma } from "@/lib/db";
import { toggleModuleActiveAction } from "@/lib/actions/admin-modules";

export const metadata: Metadata = {
  title: "Модули",
};

export default async function AdminModulesPage() {
  await ensureAdminPageAccess();
  const course = await prisma.course.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true, title: true },
  });

  if (!course) {
    return (
      <AdminShell>
        <AdminPageHeader
          breadcrumb={<AdminBreadcrumbs items={adminBreadcrumbItems("Модули")} />}
          title="Модули курса"
          description="Сначала создайте курс в базе данных."
        />
        <UiStatePanel
          state="empty"
          title="Курс не найден"
          description="Добавьте курс в Prisma seed или админ-инструменты БД."
        />
      </AdminShell>
    );
  }

  const modules = await prisma.module.findMany({
    where: { courseId: course.id },
    orderBy: { orderNumber: "asc" },
    select: {
      id: true,
      title: true,
      orderNumber: true,
      isActive: true,
      _count: { select: { progress: true } },
    },
  });

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          breadcrumb={<AdminBreadcrumbs items={adminBreadcrumbItems("Модули")} />}
          title="Модули курса"
          description={`Курс: ${course.title}. Порядок модулей задаёт цепочку доступа в личном кабинете.`}
          actions={
            <Button asChild variant="primary">
              <Link href="/admin/modules/new">Новый модуль</Link>
            </Button>
          }
        />

        <AdminTableCard
          title="Все модули"
          description={modules.length === 0 ? "Создайте первый модуль" : `${modules.length} в курсе`}
        >
          <UiStatePanel
            state={modules.length === 0 ? "empty" : "idle"}
            title="Модулей пока нет"
            description="Создайте первый модуль — к нему можно привязать лекцию, тест и практику."
            action={
              <Button asChild variant="primary">
                <Link href="/admin/modules/new">Создать модуль</Link>
              </Button>
            }
          >
            <AdminDualTable
              mobile={
                <div className="space-y-4 p-4 sm:p-5">
                  {modules.map((m, idx) => (
                    <AdminMobileCard key={m.id} className="space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs tabular-nums text-muted-foreground">№ {m.orderNumber}</p>
                          <Link href={`/admin/modules/${m.id}/edit`} className="font-medium text-foreground hover:underline">
                            {m.title}
                          </Link>
                        </div>
                        <Badge variant={m.isActive ? "success" : "outline"}>{m.isActive ? "Активен" : "Выключен"}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Записей прогресса: {m._count.progress}</p>
                      <AdminModuleMoveButtons moduleId={m.id} canUp={idx > 0} canDown={idx < modules.length - 1} />
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <form action={toggleModuleActiveAction.bind(null, m.id)} className="flex-1">
                          <Button type="submit" variant="outline" size="sm" className="w-full">
                            {m.isActive ? "Отключить" : "Включить"}
                          </Button>
                        </form>
                        <Button variant="secondary" size="sm" asChild className="flex-1">
                          <Link href={`/admin/modules/${m.id}/edit`}>Изменить</Link>
                        </Button>
                      </div>
                    </AdminMobileCard>
                  ))}
                </div>
              }
              desktop={
                <AdminTable minWidth="720px" caption="Модули курса">
                  <AdminTableHead>
                    <tr>
                      <AdminTh>№</AdminTh>
                      <AdminTh>Название</AdminTh>
                      <AdminTh>Статус</AdminTh>
                      <AdminTh>Прогресс</AdminTh>
                      <AdminTh>Порядок</AdminTh>
                      <AdminTh className="text-right">Действия</AdminTh>
                    </tr>
                  </AdminTableHead>
                  <AdminTableBody>
                    {modules.map((m, idx) => (
                      <tr key={m.id}>
                        <td className="tabular-nums text-muted-foreground">{m.orderNumber}</td>
                        <td className="font-medium">
                          <Link href={`/admin/modules/${m.id}/edit`} className="hover:text-primary hover:underline">
                            {m.title}
                          </Link>
                        </td>
                        <td>
                          <Badge variant={m.isActive ? "success" : "outline"}>{m.isActive ? "Активен" : "Выключен"}</Badge>
                        </td>
                        <td className="tabular-nums text-muted-foreground">{m._count.progress}</td>
                        <td>
                          <AdminModuleMoveButtons moduleId={m.id} canUp={idx > 0} canDown={idx < modules.length - 1} />
                        </td>
                        <td>
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <form action={toggleModuleActiveAction.bind(null, m.id)}>
                              <Button type="submit" variant="outline" size="sm">
                                {m.isActive ? "Отключить" : "Включить"}
                              </Button>
                            </form>
                            <Button variant="secondary" size="sm" asChild>
                              <Link href={`/admin/modules/${m.id}/edit`}>Изменить</Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </AdminTableBody>
                </AdminTable>
              }
            />
          </UiStatePanel>
        </AdminTableCard>
      </div>
    </AdminShell>
  );
}
