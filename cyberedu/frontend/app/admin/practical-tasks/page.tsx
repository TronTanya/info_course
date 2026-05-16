import type { Metadata } from "next";
import Link from "next/link";
import { AdminDualTable } from "@/components/admin/admin-dual-table";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
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
  const tasks = await prisma.practicalTask.findMany({
    include: {
      module: { select: { id: true, title: true, orderNumber: true } },
    },
    orderBy: [{ module: { orderNumber: "asc" } }, { createdAt: "asc" }],
  });

  return (
    <AdminShell>
      <PageHeader
        title="Практические задания"
        description="Тип и поля задания задают форму на странице практики модуля. Ограничения по файлам и длине текста учитываются при отправке."
        actions={
          <Button asChild>
            <Link href="/admin/practical-tasks/new">Новое задание</Link>
          </Button>
        }
      />

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        {tasks.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">Заданий нет — создайте первое.</p>
        ) : (
          <AdminDualTable
            mobile={
              <div className="divide-y divide-border">
                {tasks.map((t) => (
                  <div key={t.id} className="space-y-2 p-4">
                    <p className="text-xs text-muted-foreground">
                      <span className="tabular-nums">#{t.module.orderNumber}</span> {t.module.title}
                    </p>
                    <p className="font-medium text-foreground">{t.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {taskTypeRu(t.taskType)} · {checkRu(t.checkType)} · макс. {t.maxScore} б.
                    </p>
                    <Link
                      href={`/admin/practical-tasks/${t.id}/edit`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Изменить
                    </Link>
                  </div>
                ))}
              </div>
            }
            desktop={
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Модуль</th>
                    <th className="px-4 py-3 font-medium">Название</th>
                    <th className="px-4 py-3 font-medium">Тип</th>
                    <th className="px-4 py-3 font-medium">Проверка</th>
                    <th className="px-4 py-3 font-medium">Макс. балл</th>
                    <th className="px-4 py-3 text-right font-medium">Действия</th>
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
                          className="text-sm font-medium text-primary hover:underline"
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
        )}
      </div>
    </AdminShell>
  );
}
