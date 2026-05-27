"use client";

import { useActionState } from "react";
import { AdminFormStickyBar } from "@/components/admin/admin-form-sticky-bar";
import { createModuleAction, type AdminModuleFormState } from "@/lib/actions/admin-modules";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function AdminModuleCreateForm() {
  const [state, formAction, pending] = useActionState<AdminModuleFormState | null, FormData>(
    createModuleAction,
    null,
  );

  return (
    <form action={formAction} className="mx-auto max-w-xl space-y-6">
      {state?.error ? (
        <Alert variant="danger" title="Ошибка">
          {state.error}
        </Alert>
      ) : null}
      <Input name="title" label="Название" required placeholder="Название модуля" disabled={pending} />
      <Textarea
        name="description"
        label="Описание"
        rows={4}
        placeholder="Краткое описание (необязательно)"
        disabled={pending}
      />
      <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
        <input type="checkbox" name="isActive" defaultChecked className="size-4 rounded border-border" />
        Модуль активен (виден в курсе)
      </label>
      <AdminFormStickyBar backHref="/admin/modules" backLabel="Отмена">
        <Button type="submit" variant="primary" loading={pending}>
          Создать модуль
        </Button>
      </AdminFormStickyBar>
    </form>
  );
}
