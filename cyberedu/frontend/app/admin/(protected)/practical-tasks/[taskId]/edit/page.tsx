import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { AdminPracticalTaskForm } from "@/components/admin/admin-practical-task-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ensureAdminPageAccess } from "@/lib/admin-page-guard";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ taskId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { taskId } = await params;
  const t = await prisma.practicalTask.findUnique({
    where: { id: taskId },
    select: { title: true },
  });
  return { title: t ? `Практика: ${t.title}` : "Задание" };
}

export default async function AdminEditPracticalTaskPage({ params }: Props) {
  await ensureAdminPageAccess();
  const { taskId } = await params;

  const [task, modules] = await Promise.all([
    prisma.practicalTask.findUnique({ where: { id: taskId } }),
    prisma.module.findMany({
      orderBy: { orderNumber: "asc" },
      select: { id: true, title: true, orderNumber: true },
    }),
  ]);

  if (!task) notFound();

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          title="Редактирование задания"
          description="Изменение типа переключает набор полей — сохраните, чтобы применить настройки к форме студента."
          breadcrumb={
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <Link href="/admin/practical-tasks" className="hover:text-foreground">
                ← Практика
              </Link>
              <Link href={`/admin/modules/${task.moduleId}/edit`} className="hover:text-foreground">
                Модуль
              </Link>
            </div>
          }
        />
        <div>
        <AdminPracticalTaskForm
          key={task.id}
          modules={modules}
          initial={{
            id: task.id,
            moduleId: task.moduleId,
            title: task.title,
            description: task.description,
            taskType: task.taskType,
            checkType: task.checkType,
            maxScore: task.maxScore,
            minLength: task.minLength,
            expectedCommand: task.expectedCommand,
            expectedAnswerPattern: task.expectedAnswerPattern,
            interactiveExpectedAnswer: task.interactiveExpectedAnswer,
            consoleScenario: task.consoleScenario,
            allowedFileTypes: task.allowedFileTypes,
            maxFileSizeMb: task.maxFileSizeMb,
            instruction: task.instruction,
            scenarioData:
              task.scenarioData == null ? "" : JSON.stringify(task.scenarioData as object, null, 2),
          }}
        />
        </div>
      </div>
    </AdminShell>
  );
}
