"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createTestAction, type AdminTestFormState } from "@/lib/actions/admin-tests";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export type ModuleOption = { id: string; title: string; orderNumber: number };

export function AdminTestCreateForm({ modules }: { modules: ModuleOption[] }) {
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
      <Select name="moduleId" label="Модуль" required defaultValue="" disabled={pending}>
        <option value="" disabled>
          Выберите модуль
        </option>
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
      <div className="flex flex-wrap gap-2">
        <Button type="submit" loading={pending}>
          Создать и перейти к вопросам
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/tests">Отмена</Link>
        </Button>
      </div>
    </form>
  );
}
