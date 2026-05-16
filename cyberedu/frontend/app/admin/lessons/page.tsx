import type { Metadata } from "next";
import Link from "next/link";
import { AdminDualTable } from "@/components/admin/admin-dual-table";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageHeader } from "@/components/ui/page-header";
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
      <PageHeader
        title="Лекции"
        description="Все лекции курса. Создать лекцию можно на странице редактирования модуля."
      />

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        {lessons.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            Лекций нет. Откройте модуль и нажмите «Новая лекция».
          </p>
        ) : (
          <AdminDualTable
            mobile={
              <div className="divide-y divide-border">
                {lessons.map((l) => (
                  <div key={l.id} className="flex flex-col gap-2 p-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        <span className="tabular-nums">#{l.module.orderNumber}</span>{" "}
                        <Link href={`/admin/modules/${l.module.id}/edit`} className="font-medium text-foreground hover:underline">
                          {l.module.title}
                        </Link>
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">{l.title}</p>
                    </div>
                    <Link href={`/admin/lessons/${l.id}/edit`} className="text-sm font-medium text-primary hover:underline">
                      Редактировать
                    </Link>
                  </div>
                ))}
              </div>
            }
            desktop={
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Модуль</th>
                    <th className="px-4 py-3 font-medium">Лекция</th>
                    <th className="px-4 py-3 text-right font-medium">Действия</th>
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
                        <Link href={`/admin/lessons/${l.id}/edit`} className="text-sm font-medium text-primary hover:underline">
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
      </div>
    </AdminShell>
  );
}
