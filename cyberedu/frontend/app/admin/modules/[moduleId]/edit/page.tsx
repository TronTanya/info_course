import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { AdminModuleDeleteButton } from "@/components/admin/admin-module-delete-button";
import { AdminModuleEditForm } from "@/components/admin/admin-module-edit-form";
import { AdminBreadcrumbs, adminBreadcrumbItems } from "@/components/admin/admin-breadcrumbs";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { prisma } from "@/lib/db";
import { createLessonForModuleAction } from "@/lib/actions/admin-modules";

type Props = { params: Promise<{ moduleId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { moduleId } = await params;
  const m = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { title: true },
  });
  return { title: m ? `Модуль: ${m.title}` : "Модуль" };
}

export default async function AdminEditModulePage({ params }: Props) {
  const { moduleId } = await params;

  const moduleRow = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      lessons: { orderBy: { createdAt: "asc" }, select: { id: true, title: true } },
      tests: { orderBy: { createdAt: "asc" }, select: { id: true, title: true }, take: 1 },
      practicalTasks: { orderBy: { createdAt: "asc" }, select: { id: true, title: true } },
    },
  });

  if (!moduleRow) notFound();

  const courseModules = await prisma.module.findMany({
    where: { courseId: moduleRow.courseId },
    orderBy: { orderNumber: "asc" },
    select: { id: true },
  });
  const positionInCourse = courseModules.findIndex((x) => x.id === moduleId) + 1;

  const progressCount = await prisma.progress.count({ where: { moduleId } });

  return (
    <AdminShell>
      <AdminPageHeader
        title={moduleRow.title}
        description="Поля модуля и список лекций. Удаление доступно только без прогресса студентов."
        breadcrumb={
          <AdminBreadcrumbs
            items={adminBreadcrumbItems("Редактирование", { href: "/admin/modules", label: "Модули" })}
          />
        }
        meta={
          <>
            <Badge variant={moduleRow.isActive ? "success" : "outline"}>
              {moduleRow.isActive ? "Активен" : "Выключен"}
            </Badge>
            <Badge variant="secondary">Прогресс: {progressCount}</Badge>
          </>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <form action={createLessonForModuleAction.bind(null, moduleId)}>
              <Button type="submit" variant="secondary">
                Новая лекция
              </Button>
            </form>
            <AdminModuleDeleteButton moduleId={moduleId} disabled={progressCount > 0} />
          </div>
        }
      />

      <div className="mt-8 grid gap-10 pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <AdminModuleEditForm
          module={{
            id: moduleRow.id,
            title: moduleRow.title,
            description: moduleRow.description,
            orderNumber: moduleRow.orderNumber,
            isActive: moduleRow.isActive,
            courseId: moduleRow.courseId,
          }}
          positionInCourse={positionInCourse}
          moduleCount={courseModules.length}
        />

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <h2 className="text-sm font-semibold text-foreground">Тест и практика</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                {moduleRow.tests[0] ? (
                  <Link
                    href={`/admin/tests/${moduleRow.tests[0].id}/edit`}
                    className="font-medium text-primary hover:underline"
                  >
                    Тест: {moduleRow.tests[0].title}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">
                    Тест не создан —{" "}
                    <Link
                      href={`/admin/tests/new?moduleId=${moduleId}`}
                      className="font-medium text-primary hover:underline"
                    >
                      добавить
                    </Link>
                  </span>
                )}
              </li>
              {moduleRow.practicalTasks.length > 0 ? (
                moduleRow.practicalTasks.map((t) => (
                  <li key={t.id}>
                    <Link href={`/admin/practical-tasks/${t.id}/edit`} className="text-primary hover:underline">
                      Практика: {t.title}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground">
                  Практик нет —{" "}
                  <Link
                    href={`/admin/practical-tasks/new?moduleId=${moduleId}`}
                    className="font-medium text-primary hover:underline"
                  >
                    создать задание
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <h2 className="text-sm font-semibold text-foreground">Лекции модуля</h2>
            {progressCount > 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Записей прогресса: {progressCount}. Удаление модуля недоступно.
              </p>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">Прогресс по модулю отсутствует — модуль можно удалить.</p>
            )}
            {moduleRow.lessons.length === 0 ? (
              <EmptyState
                className="mt-4 py-6"
                title="Лекций пока нет"
                description="Создайте первую лекцию — студенты увидят её в траектории модуля."
                action={
                  <form action={createLessonForModuleAction.bind(null, moduleId)}>
                    <Button type="submit" variant="primary" size="sm">
                      Новая лекция
                    </Button>
                  </form>
                }
              />
            ) : (
              <ul className="mt-4 space-y-2 text-sm">
                {moduleRow.lessons.map((l) => (
                  <li key={l.id}>
                    <Link href={`/admin/lessons/${l.id}/edit`} className="text-primary hover:underline">
                      {l.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
