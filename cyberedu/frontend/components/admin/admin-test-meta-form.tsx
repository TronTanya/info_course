"use client";

import { useActionState } from "react";
import { updateTestMetaAction, type AdminTestFormState } from "@/lib/actions/admin-tests";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminTestMetaForm({
  testId,
  title,
  minScore,
}: {
  testId: string;
  title: string;
  minScore: number;
}) {
  const [state, formAction, pending] = useActionState<AdminTestFormState | null, FormData>(
    updateTestMetaAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-card">
      <input type="hidden" name="testId" value={testId} />
      {state?.error ? (
        <Alert variant="danger" title="Ошибка">
          {state.error}
        </Alert>
      ) : null}
      <Input name="title" label="Название теста" required defaultValue={title} disabled={pending} />
      <Input name="minScore" type="number" min={0} label="Проходной балл" defaultValue={String(minScore)} disabled={pending} />
      <Button type="submit" variant="primary" size="sm" loading={pending}>
        Сохранить название и порог
      </Button>
    </form>
  );
}
