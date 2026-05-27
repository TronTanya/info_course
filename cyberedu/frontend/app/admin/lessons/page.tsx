import type { Metadata } from "next";
import Link from "next/link";
import { AdminDualTable } from "@/components/admin/admin-dual-table";
import { AdminTable, AdminTableBody, AdminTableHead } from "@/components/admin/admin-table";
import { AdminBreadcrumbs, adminBreadcrumbItems } from "@/components/admin/admin-breadcrumbs";
import { AdminMobileCard } from "@/components/admin/admin-mobile-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTableCard } from "@/components/admin/admin-table-card";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { UiStatePanel } from "@/components/ui/ui-state-panel";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Лекции",
};

export default async function AdminLessonsPage() {
  const lessons = await prisma.lesson.findMany({
    orderBy: [{ module: { orderNumber: "asc" } }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      module: { select: { id: true, title: true, orderNumber: true } },
    },
  });

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          breadcrumb={<AdminBreadcrumbs items={adminBreadcrumbItems("Лекции")} />}
          title="Лекции"
          description="Все лекции курса. Новую лекцию удобнее создавать на странице редактирования модуля."
          actions={
            <Button asChild variant="outline">
              <Link href="/admin/modules">К модулям</Link>
            </Button>
          }
        />

        <AdminTableCard
          title="Все лекции"
          description={lessons.length === 0 ? "Список пуст" : `${lessons.length} в курсе`}
        >
          <UiStatePanel
            state={lessons.length === 0 ? "empty" : "idle"}
            title="Лекций пока нет"
            description="Откройте модуль в разделе «Модули» и нажмите «Новая лекция»."
            action={
              <Button asChild variant="primary">
                <Link href="/admin/modules">Перейти к модулям</Link>
              </Button>
            }
          >
            <AdminDualTable
              mobile={
                <div className="space-y-4 p-4 sm:p-5">
                  {lessons.map((l) => (
                    <AdminMobileCard key={l.id} className="flex flex-col gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          <span className="tabular-nums">#{l.module.orderNumber}</span>{" "}
                          <Link
                            href={`/admin/modules/${l.module.id}/edit`}
                            className="font-medium text-foreground hover:underline"
                          >
                            {l.module.title}
                          </Link>
                        </p>
                        <p className="mt-1 text-sm font-medium text-foreground">{l.title}</p>
                      </div>
                      <Button asChild variant="secondary" size="sm" className="w-full min-h-11">
                        <Link href={`/admin/lessons/${l.id}/edit`}>Редактировать</Link>
                      </Button>
                    </AdminMobileCard>
                  ))}
                </div>
              }
              desktop={
                <AdminTable minWidth="640px" caption="Лекции курса">
                  <AdminTableHead>
                    <tr>
                      <th>Модуль</th>
                      <th>Лекция</th>
                      <th className="text-right">Действия</th>
                    </tr>
                  </AdminTableHead>
                  <AdminTableBody>
                    {lessons.map((l) => (
                      <tr key={l.id}>
                        <td>
                          <span className="text-muted-foreground tabular-nums">#{l.module.orderNumber}</span>{" "}
                          <Link
                            href={`/admin/modules/${l.module.id}/edit`}
                            className="font-medium text-foreground hover:underline"
                          >
                            {l.module.title}
                          </Link>
                        </td>
                        <td className="text-foreground">{l.title}</td>
                        <td className="text-right">
                          <Button asChild variant="secondary" size="sm">
                            <Link href={`/admin/lessons/${l.id}/edit`}>Редактировать</Link>
                          </Button>
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
