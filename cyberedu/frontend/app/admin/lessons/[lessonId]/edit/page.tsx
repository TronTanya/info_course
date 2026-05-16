import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { AdminLessonEditorForm } from "@/components/admin/admin-lesson-editor-form";
import { PageHeader } from "@/components/ui/page-header";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ lessonId: string }> };

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
      <PageHeader
        title="Редактирование лекции"
        description="Текст в формате, совместимом с отображением в курсе (# и ## для заголовков, абзацы через пустую строку). Используйте вкладку «Превью»."
        breadcrumb={
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/admin/lessons" className="hover:text-foreground">
              ← Лекции
            </Link>
            <Link href={`/admin/modules/${lesson.moduleId}/edit`} className="hover:text-foreground">
              Модуль
            </Link>
          </div>
        }
      />
      <div className="mt-8 max-w-3xl">
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
    </AdminShell>
  );
}
