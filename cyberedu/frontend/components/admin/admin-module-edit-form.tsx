"use client";

import { useActionState } from "react";
import { updateModuleAction, type AdminModuleFormState } from "@/lib/actions/admin-modules";
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
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="moduleId" value={m.id} />
      {state?.error ? (
        <Alert variant="danger" title="Ошибка">
          {state.error}
        </Alert>
      ) : null}
      <Input
        name="title"
        label="Название"
        required
        defaultValue={m.title}
        disabled={pending}
      />
      <Textarea
        name="description"
        label="Описание"
        rows={4}
        defaultValue={m.description ?? ""}
        disabled={pending}
      />
      <Input
        name="orderPosition"
        type="number"
        min={1}
        max={moduleCount}
        label="Позиция в курсе"
        hint={`От 1 до ${moduleCount}. Меняет порядок относительно других модулей; цепочка разблокировки в курсе строится по этому порядку.`}
        defaultValue={String(positionInCourse)}
        disabled={pending}
      />
      <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={m.isActive}
          className="size-4 rounded border-border"
          disabled={pending}
        />
        Модуль активен
      </label>
      <Button type="submit" loading={pending}>
        Сохранить
      </Button>
    </form>
  );
}
