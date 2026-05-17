"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updateModuleAction, type AdminModuleFormState } from "@/lib/actions/admin-modules";
import { AdminFormSection } from "@/components/admin/admin-form-section";
import { AdminFormStickyBar } from "@/components/admin/admin-form-sticky-bar";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ModuleRow = {
  id: string;
  title: string;
  description: string | null;
  orderNumber: number;
  isActive: boolean;
  courseId: string;
};

export function AdminModuleEditForm({
  module: m,
  positionInCourse,
  moduleCount,
}: {
  module: ModuleRow;
  positionInCourse: number;
  moduleCount: number;
}) {
  const [state, formAction, pending] = useActionState<AdminModuleFormState | null, FormData>(
    updateModuleAction,
    null,
  );

  return (
    <form action={formAction} className="pb-24">
      <input type="hidden" name="moduleId" value={m.id} />

      {state?.error ? (
        <Alert variant="danger" title="Не удалось сохранить" className="mb-6">
          {state.error}
        </Alert>
      ) : null}

      <div className="space-y-6">
        <AdminFormSection title="Основное" description="Название и описание отображаются студентам в карте курса.">
          <Input name="title" label="Название" required defaultValue={m.title} disabled={pending} />
          <Textarea
            name="description"
            label="Описание"
            hint="Кратко: о чём модуль и что студент получит после прохождения."
            rows={4}
            defaultValue={m.description ?? ""}
            disabled={pending}
          />
        </AdminFormSection>

        <AdminFormSection
          title="Порядок и доступность"
          description="Порядок влияет на цепочку разблокировки модулей в личном кабинете."
        >
          <Input
            name="orderPosition"
            type="number"
            min={1}
            max={moduleCount}
            label="Позиция в курсе"
            hint={`От 1 до ${moduleCount}. Меняет порядок относительно других модулей.`}
            defaultValue={String(positionInCourse)}
            disabled={pending}
            required
          />
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-sm">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={m.isActive}
              className="mt-0.5 size-4 rounded border-border"
              disabled={pending}
            />
            <span>
              <span className="font-medium text-foreground">Модуль активен</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Неактивные модули скрыты из траектории студента.
              </span>
            </span>
          </label>
        </AdminFormSection>
      </div>

      <AdminFormStickyBar backHref="/admin/modules" backLabel="К списку модулей">
        <Button type="button" variant="outline" asChild disabled={pending}>
          <Link href="/admin/modules">Отмена</Link>
        </Button>
        <Button type="submit" variant="primary" loading={pending}>
          Сохранить изменения
        </Button>
      </AdminFormStickyBar>
    </form>
  );
}
