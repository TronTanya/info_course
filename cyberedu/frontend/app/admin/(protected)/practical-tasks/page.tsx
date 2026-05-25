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
import { ensureAdminPageAccess } from "@/lib/admin-page-guard";
import { prisma } from "@/lib/db";

function taskTypeRu(t: string): string {
  const m: Record<string, string> = {
    TEXT_ANSWER: "Текст",
    FILE_UPLOAD: "Файл",
    INTERACTIVE: "Консоль",
    COMBINED: "Комбо",
    SITUATION_CHOICE: "Ситуации",
    PASSWORD_ANALYSIS: "Пароли",
    PHISHING_ANALYSIS: "Фишинг",
    CHECKLIST: "Чек-лист",
    URL_ANALYSIS: "Ссылки",
    TRAINING_CONSOLE: "Консоль+",
    CRYPTO_TASK: "Крипто",
    LOG_ANALYSIS: "Лог",
  };
  return m[t] ?? t;
}

function checkRu(c: string): string {
  const m: Record<string, string> = { AUTO: "Авто", MANUAL: "Вручную", MIXED: "Смешанно" };
  return m[c] ?? c;
}

export const metadata: Metadata = {
  title: "Практика",
};

export default async function AdminPracticalTasksPage() {
  await ensureAdminPageAccess();
  const tasks = await prisma.practicalTask.findMany({
    include: {
      module: { select: { id: true, title: true, orderNumber: true } },
    },
    orderBy: [{ module: { orderNumber: "asc" } }, { createdAt: "asc" }],
  });

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          breadcrumb={<AdminBreadcrumbs items={adminBreadcrumbItems("Практика")} />}
          title="Практические задания"
          description="Тип задания определяет форму на странице практики. Лимиты файлов и длины текста проверяются при отправке."
          actions={
            <Button asChild variant="primary">
              <Link href="/admin/practical-tasks/new">Новое задание</Link>
            </Button>
          }
        />

        <AdminTableCard
          title="Все задания"
          description={tasks.length === 0 ? "Список пуст" : `${tasks.length} в курсе`}
        >
          <UiStatePanel
            state={tasks.length === 0 ? "empty" : "idle"}
            title="Практических заданий нет"
            description="Создайте задание и привяжите его к модулю — студенты увидят его в цепочке модуля."
            action={
              <Button asChild variant="primary">
                <Link href="/admin/practical-tasks/new">Создать задание</Link>
              </Button>
            }
          >
            <AdminDualTable
              mobile={
                <div className="space-y-4 p-4 sm:p-5">
                  {tasks.map((t) => (
                    <AdminMobileCard key={t.id} className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        <span className="tabular-nums">#{t.module.orderNumber}</span> {t.module.title}
                      </p>
                      <p className="font-medium text-foreground">{t.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {taskTypeRu(t.taskType)} · {checkRu(t.checkType)} · макс. {t.maxScore} б.
                      </p>
                      <Link
                        href={`/admin/practical-tasks/${t.id}/edit`}
                        className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline"
                      >
                        Изменить
                      </Link>
                    </AdminMobileCard>
                  ))}
                </div>
              }
              desktop={
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="sticky top-0 z-10 border-b border-border bg-muted/80 text-xs uppercase text-muted-foreground backdrop-blur-sm">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Модуль
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Название
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Тип
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Проверка
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Макс. балл
                      </th>
                      <th scope="col" className="px-4 py-3 text-right font-medium">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {tasks.map((t) => (
                      <tr key={t.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <span className="text-muted-foreground tabular-nums">#{t.module.orderNumber}</span>{" "}
                          <span className="font-medium text-foreground">{t.module.title}</span>
                        </td>
                        <td className="px-4 py-3 text-foreground">{t.title}</td>
                        <td className="px-4 py-3 text-muted-foreground">{taskTypeRu(t.taskType)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{checkRu(t.checkType)}</td>
                        <td className="px-4 py-3 tabular-nums text-muted-foreground">{t.maxScore}</td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/practical-tasks/${t.id}/edit`}
                            className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline"
                          >
                            Изменить
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
