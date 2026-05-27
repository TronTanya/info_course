"use client";

import { useActionState } from "react";
import { AdminFormStickyBar } from "@/components/admin/admin-form-sticky-bar";
import { createTestAction, type AdminTestFormState } from "@/lib/actions/admin-tests";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export type ModuleOption = { id: string; title: string; orderNumber: number };

export function AdminTestCreateForm({
  modules,
  defaultModuleId = "",
  cancelHref = "/admin/tests",
}: {
  modules: ModuleOption[];
  defaultModuleId?: string;
  cancelHref?: string;
}) {
  const selectedModuleId =
    defaultModuleId && modules.some((m) => m.id === defaultModuleId) ? defaultModuleId : "";
  const [state, formAction, pending] = useActionState<AdminTestFormState | null, FormData>(
    createTestAction,
    null,
  );

  return (
    <form action={formAction} className="mx-auto max-w-xl space-y-6">
      {state?.error ? (
        <Alert variant="danger" title="Ошибка">
          {state.error}
        </Alert>
      ) : null}
      {selectedModuleId ? (
        <p className="text-sm text-muted-foreground" role="status">
          Модуль выбран из карточки редактирования — при необходимости смените его в списке.
        </p>
      ) : null}
      <Select
        name="moduleId"
        label="Модуль"
        required
        defaultValue={selectedModuleId}
        disabled={pending}
      >
        {!selectedModuleId ? (
          <option value="" disabled>
            Выберите модуль
          </option>
        ) : null}
        {modules.map((m) => (
          <option key={m.id} value={m.id}>
            #{m.orderNumber} · {m.title}
          </option>
        ))}
      </Select>
      <Input name="title" label="Название теста" required placeholder="Контрольный тест" disabled={pending} />
      <Input
        name="minScore"
        type="number"
        min={0}
        label="Проходной балл (сумма по автоматически оцениваемым вопросам)"
        defaultValue={70}
        disabled={pending}
        hint="Минимум баллов для зачёта. Текстовые вопросы «только ручная проверка» в эту сумму не входят."
      />
      <AdminFormStickyBar backHref={cancelHref} backLabel="Отмена">
        <Button type="submit" variant="primary" loading={pending}>
          Создать и перейти к вопросам
        </Button>
      </AdminFormStickyBar>
    </form>
  );
}
