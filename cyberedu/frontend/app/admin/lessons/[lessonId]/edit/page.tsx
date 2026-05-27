import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminBreadcrumbs, adminBreadcrumbItems } from "@/components/admin/admin-breadcrumbs";
import { AdminShell } from "@/components/layout/admin-shell";
import { AdminLessonEditorForm } from "@/components/admin/admin-lesson-editor-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ lessonId: string }> };

function truncateTitle(title: string, max = 40): string {
  const t = title.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lessonId } = await params;
  const l = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { title: true },
  });
  return { title: l ? `Лекция: ${l.title}` : "Лекция" };
}

export default async function AdminEditLessonPage({ params }: Props) {
  const { lessonId } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      moduleId: true,
      title: true,
      content: true,
      videoUrl: true,
      allowAiAdaptation: true,
      module: { select: { title: true } },
    },
  });

  if (!lesson) notFound();

  return (
    <AdminShell>
      <div className="space-y-6 pb-24">
        <AdminPageHeader
          title="Редактирование лекции"
          description="Текст в формате, совместимом с отображением в курсе (# и ## для заголовков, абзацы через пустую строку). Используйте вкладку «Превью»."
          breadcrumb={
            <AdminBreadcrumbs
              items={adminBreadcrumbItems(truncateTitle(lesson.title), {
                href: "/admin/lessons",
                label: "Лекции",
              })}
            />
          }
        />
        <div className="max-w-3xl">
        <AdminLessonEditorForm
          lesson={{
            id: lesson.id,
            moduleId: lesson.moduleId,
            title: lesson.title,
            content: lesson.content,
            videoUrl: lesson.videoUrl,
            allowAiAdaptation: lesson.allowAiAdaptation,
          }}
          moduleTitle={lesson.module.title}
        />
        </div>
      </div>
    </AdminShell>
  );
}
