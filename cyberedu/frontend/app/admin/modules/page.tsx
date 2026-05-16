import type { Metadata } from "next";
import Link from "next/link";
import { AdminDualTable } from "@/components/admin/admin-dual-table";
import { AdminShell } from "@/components/layout/admin-shell";
import { AdminModuleMoveButtons } from "@/components/admin/admin-module-move-buttons";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { toggleModuleActiveAction } from "@/lib/actions/admin-modules";

export const metadata: Metadata = {
  title: "Модули",
};

export default async function AdminModulesPage() {
  const course = await prisma.course.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true, title: true },
  });

  if (!course) {
    return (
      <AdminShell>
        <PageHeader title="Модули курса" description="Сначала создайте курс в базе данных." />
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
      <PageHeader
        title="Модули курса"
        description={`Курс: ${course.title}. Порядок модулей задаёт цепочку доступа в личном кабинете (после завершения предыдущего активного модуля).`}
        actions={
          <Button asChild>
            <Link href="/admin/modules/new">Новый модуль</Link>
          </Button>
        }
      />

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        {modules.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">Модулей пока нет — создайте первый.</p>
        ) : (
          <AdminDualTable
            mobile={
              <div className="divide-y divide-border">
                {modules.map((m, idx) => (
                  <div key={m.id} className="space-y-3 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs tabular-nums text-muted-foreground">№ {m.orderNumber}</p>
                        <Link href={`/admin/modules/${m.id}/edit`} className="font-medium text-foreground hover:underline">
                          {m.title}
                        </Link>
                      </div>
                      <span className={m.isActive ? "text-sm text-success" : "text-sm text-muted-foreground"}>
                        {m.isActive ? "Активен" : "Выключен"}
                      </span>
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
                  </div>
                ))}
              </div>
            }
            desktop={
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">№</th>
                    <th className="px-4 py-3 font-medium">Название</th>
                    <th className="px-4 py-3 font-medium">Статус</th>
                    <th className="px-4 py-3 font-medium">Прогресс</th>
                    <th className="px-4 py-3 font-medium">Порядок</th>
                    <th className="px-4 py-3 text-right font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {modules.map((m, idx) => (
                    <tr key={m.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 tabular-nums text-muted-foreground">{m.orderNumber}</td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        <Link href={`/admin/modules/${m.id}/edit`} className="hover:underline">
                          {m.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={m.isActive ? "text-success" : "text-muted-foreground"}>
                          {m.isActive ? "Активен" : "Выключен"}
                        </span>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-muted-foreground">{m._count.progress}</td>
                      <td className="px-4 py-3">
                        <AdminModuleMoveButtons
                          moduleId={m.id}
                          canUp={idx > 0}
                          canDown={idx < modules.length - 1}
                        />
                      </td>
                      <td className="px-4 py-3">
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
                </tbody>
              </table>
            }
          />
        )}
      </div>
    </AdminShell>
  );
}
