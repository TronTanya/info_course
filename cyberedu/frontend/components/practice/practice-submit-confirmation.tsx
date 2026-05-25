"use client";

import { AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  formatPracticeSubmitSummaryLines,
  resolvePracticeSubmitEditPolicy,
  type PracticeSubmitSummary,
} from "@/lib/practice-submit-confirmation-ui";
import { cn } from "@/lib/utils";

export type PracticeSubmitConfirmationProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practiceTitle: string;
  summary: PracticeSubmitSummary;
  allowsResubmitOnRevision?: boolean;
  pending: boolean;
  error?: string | null;
  onConfirm: () => void;
};

export function PracticeSubmitConfirmation({
  open,
  onOpenChange,
  practiceTitle,
  summary,
  allowsResubmitOnRevision = true,
  pending,
  error,
  onConfirm,
}: PracticeSubmitConfirmationProps) {
  const summaryLines = formatPracticeSubmitSummaryLines(summary);
  const editPolicy = resolvePracticeSubmitEditPolicy(allowsResubmitOnRevision);

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (pending && !next) return;
        onOpenChange(next);
      }}
      title="Отправить на проверку?"
      description="Проверьте резюме ответа перед отправкой."
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            Вернуться к редактированию
          </Button>
          <Button
            type="button"
            variant="primary"
            className="w-full sm:w-auto"
            loading={pending}
            disabled={pending}
            onClick={onConfirm}
          >
            Отправить на проверку
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-border/70 bg-muted/15 px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Практика</p>
          <p className="mt-1 font-display text-sm font-semibold text-foreground">{practiceTitle}</p>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Резюме ответа</p>
          <ul className="mt-2 space-y-1 text-sm text-foreground">
            {summaryLines.map((line) => (
              <li key={line} className="text-pretty">
                {line}
              </li>
            ))}
          </ul>
        </div>

        <p
          className={cn(
            "rounded-lg border px-3 py-2 text-sm",
            "border-warning/35 bg-warning/[0.08] text-foreground",
          )}
          role="note"
        >
          После отправки работа уйдёт на проверку.
        </p>

        <p
          className={cn(
            "rounded-lg border px-3 py-2 text-sm text-pretty",
            editPolicy.canEditAfterSubmit
              ? "border-success/30 bg-success/[0.06] text-foreground"
              : "border-border/70 bg-muted/10 text-muted-foreground",
          )}
        >
          {editPolicy.canEditAfterSubmit
            ? "После отправки вы сможете вернуться и изменить ответ до закрытия проверки."
            : editPolicy.message}
        </p>

        {error ? (
          <p
            className="flex items-start gap-2 rounded-lg border border-danger/35 bg-danger/10 px-3 py-2 text-sm text-danger"
            role="alert"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{error}</span>
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
