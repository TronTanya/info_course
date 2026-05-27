import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminBreadcrumbs, adminBreadcrumbItems } from "@/components/admin/admin-breadcrumbs";
import { AdminShell } from "@/components/layout/admin-shell";
import { AdminPracticalTaskForm } from "@/components/admin/admin-practical-task-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ taskId: string }> };

function truncateTitle(title: string, max = 40): string {
  const t = title.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { taskId } = await params;
  const t = await prisma.practicalTask.findUnique({
    where: { id: taskId },
    select: { title: true },
  });
  return { title: t ? `Практика: ${t.title}` : "Задание" };
}

export default async function AdminEditPracticalTaskPage({ params }: Props) {
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
            <AdminBreadcrumbs
              items={adminBreadcrumbItems(truncateTitle(task.title), {
                href: "/admin/practical-tasks",
                label: "Практика",
              })}
            />
          }
        />
        <div className="pb-24">
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
