"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import {
  reviewSubmissionAction,
  saveSubmissionReviewCommentAction,
  type AdminSubmissionReviewState,
} from "@/lib/actions/admin-submissions";
import type { AdminSubmissionReviewIntent } from "@/lib/admin-submission-review-intent";
import { reviewIntentRequiresConfirm } from "@/lib/admin-submission-review-intent";
import { sanitizeAdminActionError } from "@/lib/admin-ui-states";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SubmissionStatus } from "@prisma/client";
import { cyber } from "@/lib/design-system/cyber";
import { cn } from "@/lib/utils";

const CONFIRM_COPY: Record<
  AdminSubmissionReviewIntent,
  { title: string; description: string; confirmLabel: string; variant: "danger" | "primary" }
> = {
  accept: {
    title: "Принять работу?",
    description:
      "Статус «Принято» и балл будут зафиксированы на сервере. Студент увидит результат в личном кабинете.",
    confirmLabel: "Принять",
    variant: "primary",
  },
  revision: {
    title: "Отправить на доработку?",
    description:
      "Статус изменится на «На доработку». Комментарий для студента обязателен и будет показан в практике.",
    confirmLabel: "На доработку",
    variant: "primary",
  },
  reject: {
    title: "Отклонить работу?",
    description: "Статус изменится на «Отклонено». Это действие фиксируется в журнале безопасности.",
    confirmLabel: "Отклонить",
    variant: "danger",
  },
};

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
  const formRef = useRef<HTMLFormElement>(null);
  const [confirmIntent, setConfirmIntent] = useState<AdminSubmissionReviewIntent | null>(null);

  const [reviewState, reviewAction, reviewPending] = useActionState<
    AdminSubmissionReviewState | null,
    FormData
  >(reviewSubmissionAction, null);

  const [commentState, commentAction, commentPending] = useActionState<
    AdminSubmissionReviewState | null,
    FormData
  >(saveSubmissionReviewCommentAction, null);

  const router = useRouter();
  useEffect(() => {
    if (commentState?.saved) router.refresh();
  }, [commentState?.saved, router]);

  const pending = reviewPending || commentPending;
  const canReview = currentStatus !== "DRAFT";

  const submitWithIntent = (intent: AdminSubmissionReviewIntent) => {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    fd.set("intent", intent);
    void reviewAction(fd);
    setConfirmIntent(null);
  };

  const confirmOpen = confirmIntent != null && reviewIntentRequiresConfirm(confirmIntent);
  const confirmMeta = confirmIntent ? CONFIRM_COPY[confirmIntent] : null;

  return (
    <div className={cn(cyber.panel, "card-gradient space-y-4 p-4 sm:p-5")}>
      <div aria-live="polite" aria-atomic="true" className="space-y-4">
        {reviewState?.error ? (
          <Alert variant="danger" title="Ошибка проверки" role="alert">
            {sanitizeAdminActionError(reviewState.error)}
          </Alert>
        ) : null}
        {commentState?.error ? (
          <Alert variant="danger" title="Ошибка сохранения" role="alert">
            {sanitizeAdminActionError(commentState.error)}
          </Alert>
        ) : null}
        {commentState?.saved ? (
          <Alert variant="success" title="Сохранено">
            Комментарий для студента обновлён без смены статуса.
          </Alert>
        ) : null}
      </div>

      <dl className="grid gap-2 text-sm">
        <div>
          <dt className="typo-label text-muted-foreground">Статус</dt>
          <dd className="font-medium text-foreground">{statusRu(currentStatus)}</dd>
        </div>
        <div>
          <dt className="typo-label text-muted-foreground">Балл</dt>
          <dd className="tabular-nums text-foreground">
            {currentScore != null ? `${currentScore} / ${maxScore}` : "—"}
          </dd>
        </div>
      </dl>

      <form ref={formRef} className="space-y-4">
        <input type="hidden" name="submissionId" value={submissionId} />

        <Input
          name="score"
          type="number"
          min={0}
          max={maxScore}
          label={`Балл (0–${maxScore})`}
          defaultValue={currentScore != null ? String(currentScore) : ""}
          disabled={pending || !canReview}
          hint="Обязателен при «Принять». Итоговый статус выставляется только на сервере."
        />

        <Textarea
          name="adminComment"
          label="Комментарий для студента"
          rows={4}
          defaultValue={currentComment ?? ""}
          disabled={pending || !canReview}
          hint="Виден студенту после проверки или при статусе «На доработку». Отдельных admin-only полей в схеме нет."
        />

        <div className="flex flex-col gap-2 pt-1">
          <Button
            type="button"
            disabled={pending || !canReview}
            onClick={() => setConfirmIntent("accept")}
          >
            Принять
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pending || !canReview}
            onClick={() => setConfirmIntent("revision")}
          >
            Отправить на доработку
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={pending || !canReview}
            onClick={() => setConfirmIntent("reject")}
          >
            Отклонить
          </Button>
          <Button
            type="submit"
            variant="ghost"
            className="w-full"
            formAction={commentAction}
            loading={commentPending}
            disabled={pending || !canReview}
          >
            Сохранить комментарий
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/submissions">К списку</Link>
          </Button>
        </div>
      </form>

      {confirmMeta ? (
        <AdminConfirmDialog
          open={confirmOpen}
          onOpenChange={(open) => {
            if (!open) setConfirmIntent(null);
          }}
          title={confirmMeta.title}
          description={confirmMeta.description}
          confirmLabel={confirmMeta.confirmLabel}
          variant={confirmMeta.variant}
          loading={reviewPending}
          onConfirm={() => {
            if (confirmIntent) submitWithIntent(confirmIntent);
          }}
        />
      ) : null}
    </div>
  );
}
