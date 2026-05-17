import type { Metadata } from "next";
import Link from "next/link";
import { AdminDualTable } from "@/components/admin/admin-dual-table";
import { AdminBreadcrumbs, adminBreadcrumbItems } from "@/components/admin/admin-breadcrumbs";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTableCard } from "@/components/admin/admin-table-card";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
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
          {lessons.length === 0 ? (
            <EmptyState
              className="m-6"
              title="Лекций пока нет"
              description="Откройте модуль в разделе «Модули» и нажмите «Новая лекция»."
              action={
                <Button asChild variant="primary">
                  <Link href="/admin/modules">Перейти к модулям</Link>
                </Button>
              }
            />
          ) : (
            <AdminDualTable
              mobile={
                <div className="space-y-4 p-4 sm:p-5">
                  {lessons.map((l) => (
                    <div key={l.id} className="ce-admin-mobile-card flex flex-col gap-2 rounded-2xl border border-border/60 bg-card/80 p-4">
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
                      <Link
                        href={`/admin/lessons/${l.id}/edit`}
                        className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline"
                      >
                        Редактировать
                      </Link>
                    </div>
                  ))}
                </div>
              }
              desktop={
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="sticky top-0 z-10 border-b border-border bg-muted/80 text-xs uppercase text-muted-foreground backdrop-blur-sm">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Модуль
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Лекция
                      </th>
                      <th scope="col" className="px-4 py-3 text-right font-medium">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {lessons.map((l) => (
                      <tr key={l.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <span className="text-muted-foreground tabular-nums">#{l.module.orderNumber}</span>{" "}
                          <Link
                            href={`/admin/modules/${l.module.id}/edit`}
                            className="font-medium text-foreground hover:underline"
                          >
                            {l.module.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-foreground">{l.title}</td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/lessons/${l.id}/edit`}
                            className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline"
                          >
                            Редактировать
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              }
            />
          )}
        </AdminTableCard>
      </div>
    </AdminShell>
  );
}
