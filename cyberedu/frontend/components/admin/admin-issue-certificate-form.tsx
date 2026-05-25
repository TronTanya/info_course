"use client";

import { useActionState } from "react";
import { AdminLiveRegion } from "@/components/admin/admin-live-region";
import {
  adminIssueCertificateAction,
  type AdminIssueCertificateState,
} from "@/lib/actions/admin-certificates";
import { AdminActionError } from "@/components/admin/admin-states";
import { Button } from "@/components/ui/button";

export function AdminIssueCertificateForm({
  userId,
  courseId,
  studentLabel,
  compact = false,
}: {
  userId: string;
  courseId: string;
  studentLabel: string;
  /** В таблице реестра — только кнопка «Выдать». */
  compact?: boolean;
}) {
  const [state, formAction, pending] = useActionState<AdminIssueCertificateState | null, FormData>(
    adminIssueCertificateAction,
    null,
  );
  const announcement = state?.success
    ? `Сертификат выдан${state.certificateNumber ? `: ${state.certificateNumber}` : ""}.`
    : state?.error
      ? "Ошибка выдачи сертификата."
      : null;

  return (
    <form
      action={formAction}
      className={compact ? "inline-flex flex-col gap-1" : "flex flex-col gap-2 sm:flex-row sm:items-center"}
    >
      <AdminLiveRegion message={announcement} politeness={state?.error ? "assertive" : "polite"} />
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="courseId" value={courseId} />
      {!compact ? (
        <span className="min-w-0 flex-1 truncate text-sm text-foreground">{studentLabel}</span>
      ) : null}
      <Button type="submit" size="sm" variant="secondary" loading={pending} className="min-h-9 shrink-0">
        Выдать
      </Button>
      {state?.error ? <AdminActionError message={state.error} className="w-full" /> : null}
      {state?.success ? (
        <p className="w-full text-xs text-success">
          Выдано: {state.certificateNumber ?? state.certificateId}
        </p>
      ) : null}
    </form>
  );
}
