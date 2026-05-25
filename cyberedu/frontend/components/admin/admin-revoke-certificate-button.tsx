"use client";

import { useActionState, useState } from "react";
import {
  adminRevokeCertificateAction,
  type AdminRevokeCertificateState,
} from "@/lib/actions/admin-certificates";
import { REVOKE_REASON_MAX_LENGTH } from "@/lib/certificate-registry";
import { AdminActionError } from "@/components/admin/admin-states";
import { AdminLiveRegion } from "@/components/admin/admin-live-region";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";

export function AdminRevokeCertificateButton({
  certificateId,
  certificateNumber,
  supportsRevokeReason = true,
}: {
  certificateId: string;
  certificateNumber: string;
  /** false — скрыть поле причины (если backend не поддерживает audit reason). */
  supportsRevokeReason?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [state, formAction, pending] = useActionState<AdminRevokeCertificateState | null, FormData>(
    adminRevokeCertificateAction,
    null,
  );

  const liveMessage = state?.success
    ? `Сертификат ${certificateNumber} отозван. Публичная проверка покажет статус revoked.`
    : state?.error
      ? state.error
      : null;

  return (
    <>
      <AdminLiveRegion message={liveMessage} politeness={state?.error ? "assertive" : "polite"} />

      <Button
        type="button"
        size="sm"
        variant="outline"
        className="min-h-9 border-danger/40 text-danger hover:bg-danger/10"
        disabled={pending}
        onClick={() => setOpen(true)}
      >
        Отозвать
      </Button>

      {state?.error && !open ? (
        <AdminActionError message={state.error} className="mt-1 max-w-56 text-xs" />
      ) : null}

      <Modal
        open={open}
        onOpenChange={(next) => {
          if (!pending) {
            setOpen(next);
            if (!next) setReason("");
          }
        }}
        title="Отозвать сертификат?"
        description={`Запись ${certificateNumber} останется в реестре; статус сменится на revoked. Физическое удаление не выполняется.`}
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              form="admin-revoke-certificate-form"
              variant="danger"
              loading={pending}
              disabled={pending}
            >
              Отозвать
            </Button>
          </>
        }
      >
        <form id="admin-revoke-certificate-form" action={formAction} className="space-y-4">
          <input type="hidden" name="certificateId" value={certificateId} />
          <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
            <li>Публичная страница verify покажет статус «отозван».</li>
            <li>Действие доступно только администратору (server action).</li>
            <li>Событие записывается в журнал аудита.</li>
          </ul>
          {supportsRevokeReason ? (
            <div className="space-y-1.5">
              <label htmlFor={`revoke-reason-${certificateId}`} className="text-xs font-medium text-foreground">
                Причина отзыва <span className="font-normal text-muted-foreground">(необязательно)</span>
              </label>
              <Textarea
                id={`revoke-reason-${certificateId}`}
                name="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Например: ошибочная выдача, дубликат, запрос студента…"
                rows={3}
                maxLength={REVOKE_REASON_MAX_LENGTH}
                disabled={pending}
                className="resize-y text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Сохраняется только в audit log, не отображается на публичной verify.
              </p>
            </div>
          ) : null}
          {state?.error && open ? <AdminActionError message={state.error} /> : null}
        </form>
      </Modal>
    </>
  );
}
