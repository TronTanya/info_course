"use client";

import { AlertTriangle, CheckCircle2, ListChecks, Lock, Send } from "lucide-react";
import {
  buildTestSubmitSummary,
  formatUnansweredList,
  TEST_SUBMIT_CONFIRM_TITLE,
  TEST_SUBMIT_WARNING,
} from "@/lib/test-submit-confirmation";
import { TEST_RETURN_TO_QUESTIONS_CTA, TEST_SUBMIT_CTA } from "@/lib/test-flow";
import { formatPassingScore } from "@/lib/test-ui";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { FormFeedback } from "@/components/ui/form-feedback";
import { cyber } from "@/lib/design-system/cyber";
import { cn } from "@/lib/utils";

export type TestSubmitConfirmationProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  answeredCount: number;
  total: number;
  /** Номера вопросов без ответа (1-based). */
  unansweredIndexes: number[];
  minScore: number;
  maxScore: number;
  onConfirm: () => void;
  pending?: boolean;
  /** Ошибка server action — диалог остаётся открытым. */
  error?: string | null;
};

export function TestSubmitConfirmation({
  open,
  onOpenChange,
  answeredCount,
  total,
  unansweredIndexes,
  minScore,
  maxScore,
  onConfirm,
  pending = false,
  error = null,
}: TestSubmitConfirmationProps) {
  const summary = buildTestSubmitSummary(total, answeredCount, unansweredIndexes);
  const unansweredList = formatUnansweredList(unansweredIndexes);

  const handleConfirm = () => {
    if (pending || !summary.canSubmit) return;
    onConfirm();
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        onOpenChange(next);
      }}
      title={TEST_SUBMIT_CONFIRM_TITLE}
      description="Проверьте сводку перед отправкой."
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="min-h-12 w-full touch-manipulation sm:w-auto"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            {TEST_RETURN_TO_QUESTIONS_CTA}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="min-h-12 w-full touch-manipulation gap-2 sm:w-auto"
            loading={pending}
            disabled={!summary.canSubmit || pending}
            aria-describedby={!summary.canSubmit && summary.blockReason ? "test-submit-block-reason" : undefined}
            onClick={handleConfirm}
          >
            <Send className="size-4" aria-hidden />
            {TEST_SUBMIT_CTA}
          </Button>
        </>
      }
    >
      <div className="ce-test-submit-confirmation space-y-4">
        <div
          className={cn(
            "ce-glass flex gap-3 rounded-xl border px-4 py-3 text-sm",
            "border-primary/25 bg-primary/[0.04]",
          )}
          role="note"
        >
          <Lock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <p className="text-pretty text-muted-foreground">{TEST_SUBMIT_WARNING}</p>
        </div>

        <dl
          className={cn(
            "grid grid-cols-2 gap-3 rounded-xl border border-border/70 p-4 sm:grid-cols-4",
            cyber.panelStatic,
          )}
        >
          <Stat label="Всего вопросов" value={String(summary.total)} />
          <Stat label="Отвечено" value={String(summary.answered)} tone="success" />
          <Stat
            label="Не отвечено"
            value={String(summary.unanswered)}
            tone={summary.unanswered > 0 ? "danger" : "default"}
          />
          <Stat label="Проходной балл" value={formatPassingScore(minScore, maxScore)} small />
        </dl>

        {summary.allAnswered ? (
          <p
            className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/8 px-4 py-3 text-sm text-success"
            role="status"
          >
            <CheckCircle2 className="size-4 shrink-0" aria-hidden />
            Все вопросы заполнены — можно отправлять на проверку.
          </p>
        ) : (
          <div
            className="space-y-2 rounded-xl border border-danger/30 bg-danger/8 px-4 py-3 text-sm"
            role="alert"
          >
            <p className="flex items-center gap-2 font-medium text-danger">
              <AlertTriangle className="size-4 shrink-0" aria-hidden />
              Пропущено: {summary.unanswered}{" "}
              {summary.unanswered === 1 ? "вопрос" : summary.unanswered < 5 ? "вопроса" : "вопросов"}
            </p>
            {unansweredList ? (
              <p className="text-muted-foreground">
                Номера: <span className="font-mono font-medium text-foreground">{unansweredList}</span>
              </p>
            ) : null}
            {summary.blockReason ? (
              <p id="test-submit-block-reason" className="text-pretty text-muted-foreground">
                {summary.blockReason}
              </p>
            ) : null}
          </div>
        )}

        {error ? (
          <FormFeedback id="test-submit-error" message={error} />
        ) : null}

        {pending ? (
          <p className="text-center text-xs text-muted-foreground" role="status" aria-live="polite">
            <ListChecks className="mr-1 inline size-3.5 align-text-bottom" aria-hidden />
            Отправка ответов на сервер… повторная отправка заблокирована.
          </p>
        ) : null}
      </div>
    </Modal>
  );
}

function Stat({
  label,
  value,
  tone = "default",
  small,
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "danger";
  small?: boolean;
}) {
  const toneHint =
    tone === "success" ? "в норме" : tone === "danger" ? "требует внимания" : undefined;

  return (
    <div className="min-w-0" aria-label={toneHint ? `${label}: ${value}, ${toneHint}` : `${label}: ${value}`}>
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "mt-0.5 font-semibold tabular-nums text-foreground",
          small && "text-xs leading-snug font-medium",
          !small && "text-lg",
          tone === "success" && "text-success",
          tone === "danger" && "text-danger",
        )}
      >
        {value}
        {tone === "danger" ? <span className="sr-only">, требует внимания</span> : null}
        {tone === "success" ? <span className="sr-only">, в норме</span> : null}
      </dd>
    </div>
  );
}
