"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { LessonRichText } from "@/components/lesson/lesson-rich-text";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { updateLessonAction, type AdminLessonFormState } from "@/lib/actions/admin-lessons";

type LessonRow = {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  videoUrl: string | null;
  allowAiAdaptation: boolean;
};

export function AdminLessonEditorForm({
  lesson,
  moduleTitle,
}: {
  lesson: LessonRow;
  moduleTitle: string;
}) {
  const [content, setContent] = useState(lesson.content);
  const [state, formAction, pending] = useActionState<AdminLessonFormState | null, FormData>(
    updateLessonAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="lessonId" value={lesson.id} />
      <input type="hidden" name="content" value={content} />
      {state?.error ? (
        <Alert variant="danger" title="Ошибка">
          {state.error}
        </Alert>
      ) : null}
      <p className="text-sm text-muted-foreground">
        Модуль: <span className="font-medium text-foreground">{moduleTitle}</span>
      </p>
      <Input name="title" label="Название" required defaultValue={lesson.title} disabled={pending} />
      <Input
        name="videoUrl"
        label="URL видео"
        type="url"
        placeholder="https://..."
        defaultValue={lesson.videoUrl ?? ""}
        disabled={pending}
      />
      <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          name="allowAiAdaptation"
          value="true"
          defaultChecked={lesson.allowAiAdaptation}
          className="size-4 rounded border-border"
          disabled={pending}
        />
        Разрешить AI-адаптацию для этой лекции
      </label>
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Текст лекции (Markdown-подобный: # заголовок, ## подзаголовок, абзацы через пустую строку)</p>
        <Tabs defaultValue="edit">
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="edit" className="flex-1">
              Редактирование
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex-1">
              Превью
            </TabsTrigger>
          </TabsList>
          <TabsContent value="edit" className="mt-3">
            <Textarea
              label={undefined}
              rows={18}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="font-mono text-sm"
              disabled={pending}
            />
          </TabsContent>
          <TabsContent value="preview" className="mt-3 min-h-50 border border-border/80 bg-muted/20 p-4">
            <LessonRichText source={content} />
          </TabsContent>
        </Tabs>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" loading={pending}>
          Сохранить
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/lessons">К списку лекций</Link>
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={`/admin/modules/${lesson.moduleId}/edit`}>К модулю</Link>
        </Button>
      </div>
    </form>
  );
}
