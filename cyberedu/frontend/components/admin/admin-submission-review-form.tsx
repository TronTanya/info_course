"use client";

import { useActionState } from "react";
import Link from "next/link";
import { reviewSubmissionAction, type AdminSubmissionReviewState } from "@/lib/actions/admin-submissions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { SubmissionStatus } from "@prisma/client";

function statusRu(s: SubmissionStatus): string {
  const m: Record<string, string> = {
    DRAFT: "Черновик",
    SUBMITTED: "Отправлено",
    CHECKING: "На проверке",
    ACCEPTED: "Принято",
    REJECTED: "Отклонено",
    NEEDS_REVISION: "На доработке",
  };
  return m[s] ?? s;
}

export function AdminSubmissionReviewForm({
  submissionId,
  maxScore,
  currentStatus,
  currentScore,
  currentComment,
}: {
  submissionId: string;
  maxScore: number;
  currentStatus: SubmissionStatus;
  currentScore: number | null;
  currentComment: string | null;
}) {
  const [state, formAction, pending] = useActionState<AdminSubmissionReviewState | null, FormData>(
    reviewSubmissionAction,
    null,
  );

  const canReview = currentStatus !== "DRAFT";

  const defaultStatus: "ACCEPTED" | "REJECTED" | "NEEDS_REVISION" =
    currentStatus === "ACCEPTED" || currentStatus === "REJECTED" || currentStatus === "NEEDS_REVISION"
      ? currentStatus
      : "ACCEPTED";

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-card">
      <input type="hidden" name="submissionId" value={submissionId} />
      {state?.error ? (
        <Alert variant="danger" title="Ошибка">
          {state.error}
        </Alert>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Текущий статус в системе: <span className="font-medium text-foreground">{statusRu(currentStatus)}</span>
      </p>

      <Input
        name="score"
        type="number"
        min={0}
        max={maxScore}
        label={`Балл (0–${maxScore})`}
        defaultValue={currentScore != null ? String(currentScore) : ""}
        disabled={pending || !canReview}
        hint="Обязателен при статусе «Принято». Не может превышать максимальный балл задания."
      />

      <Textarea
        name="adminComment"
        label="Комментарий для студента"
        rows={4}
        defaultValue={currentComment ?? ""}
        disabled={pending || !canReview}
        hint="При «На доработке» комментарий отображается в личном кабинете."
      />

      <Select name="status" label="Новый статус" required defaultValue={defaultStatus} disabled={pending || !canReview}>
        <option value="ACCEPTED">Принято</option>
        <option value="REJECTED">Отклонено</option>
        <option value="NEEDS_REVISION">На доработке</option>
      </Select>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" loading={pending} disabled={!canReview}>
          Сохранить проверку
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/submissions">К списку</Link>
        </Button>
      </div>
    </form>
  );
}
