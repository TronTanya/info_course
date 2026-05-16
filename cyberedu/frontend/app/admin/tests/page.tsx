import type { Metadata } from "next";
import Link from "next/link";
import { AdminDualTable } from "@/components/admin/admin-dual-table";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
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
      <PageHeader
        title="Тесты"
        description="Контрольные тесты по модулям. Вопросы и правильные ответы на стороне студента не раскрываются — проверка на сервере."
        actions={
          <Button asChild>
            <Link href="/admin/tests/new">Новый тест</Link>
          </Button>
        }
      />

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        {tests.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">Тестов пока нет — создайте первый.</p>
        ) : (
          <AdminDualTable
            mobile={
              <div className="divide-y divide-border">
                {tests.map((t) => (
                  <div key={t.id} className="space-y-2 p-4">
                    <p className="text-xs text-muted-foreground">
                      <span className="tabular-nums">#{t.module.orderNumber}</span> {t.module.title}
                    </p>
                    <p className="font-medium text-foreground">{t.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Порог: {t.minScore} · Вопросов: {t._count.questions}
                    </p>
                    <Link href={`/admin/tests/${t.id}/edit`} className="text-sm font-medium text-primary hover:underline">
                      Редактировать
                    </Link>
                  </div>
                ))}
              </div>
            }
            desktop={
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Модуль</th>
                    <th className="px-4 py-3 font-medium">Тест</th>
                    <th className="px-4 py-3 font-medium">Порог</th>
                    <th className="px-4 py-3 font-medium">Вопросы</th>
                    <th className="px-4 py-3 text-right font-medium">Действия</th>
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
                        <Link href={`/admin/tests/${t.id}/edit`} className="text-sm font-medium text-primary hover:underline">
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
