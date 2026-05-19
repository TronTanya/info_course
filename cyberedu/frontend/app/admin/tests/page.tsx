import type { Metadata } from "next";
import Link from "next/link";
import { AdminDualTable } from "@/components/admin/admin-dual-table";
import { AdminBreadcrumbs, adminBreadcrumbItems } from "@/components/admin/admin-breadcrumbs";
import { AdminMobileCard } from "@/components/admin/admin-mobile-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTableCard } from "@/components/admin/admin-table-card";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { UiStatePanel } from "@/components/ui/ui-state-panel";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Тесты",
};

export default async function AdminTestsPage() {
  const tests = await prisma.test.findMany({
    include: {
      module: { select: { id: true, title: true, orderNumber: true } },
      _count: { select: { questions: true } },
    },
    orderBy: [{ module: { orderNumber: "asc" } }, { createdAt: "asc" }],
  });

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          breadcrumb={<AdminBreadcrumbs items={adminBreadcrumbItems("Тесты")} />}
          title="Тесты"
          description="Контрольные по модулям. Ответы проверяются на сервере — студент не видит правильные варианты."
          actions={
            <Button asChild variant="primary">
              <Link href="/admin/tests/new">Новый тест</Link>
            </Button>
          }
        />

        <AdminTableCard
          title="Все тесты"
          description={tests.length === 0 ? "Список пуст" : `${tests.length} в курсе`}
        >
          <UiStatePanel
            state={tests.length === 0 ? "empty" : "idle"}
            title="Тестов пока нет"
            description="Создайте тест и привяжите его к модулю — студенты увидят его после лекции."
            action={
              <Button asChild variant="primary">
                <Link href="/admin/tests/new">Создать тест</Link>
              </Button>
            }
          >
            <AdminDualTable
              mobile={
                <div className="space-y-4 p-4 sm:p-5">
                  {tests.map((t) => (
                    <AdminMobileCard key={t.id} className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        <span className="tabular-nums">#{t.module.orderNumber}</span> {t.module.title}
                      </p>
                      <p className="font-medium text-foreground">{t.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Порог: {t.minScore} · Вопросов: {t._count.questions}
                      </p>
                      <Link
                        href={`/admin/tests/${t.id}/edit`}
                        className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline"
                      >
                        Редактировать
                      </Link>
                    </AdminMobileCard>
                  ))}
                </div>
              }
              desktop={
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="sticky top-0 z-10 border-b border-border bg-muted/80 text-xs uppercase text-muted-foreground backdrop-blur-sm">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Модуль
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Тест
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Порог
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Вопросы
                      </th>
                      <th scope="col" className="px-4 py-3 text-right font-medium">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {tests.map((t) => (
                      <tr key={t.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <span className="text-muted-foreground tabular-nums">#{t.module.orderNumber}</span>{" "}
                          <span className="font-medium text-foreground">{t.module.title}</span>
                        </td>
                        <td className="px-4 py-3 text-foreground">{t.title}</td>
                        <td className="px-4 py-3 tabular-nums text-muted-foreground">{t.minScore}</td>
                        <td className="px-4 py-3 tabular-nums text-muted-foreground">{t._count.questions}</td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/tests/${t.id}/edit`}
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
          </UiStatePanel>
        </AdminTableCard>
      </div>
    </AdminShell>
  );
}
