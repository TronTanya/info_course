"use client";

import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { formatPassingScore } from "@/lib/test-ui";

export function TestSubmitDialog({
  open,
  onOpenChange,
  answeredCount,
  total,
  unansweredIndexes,
  minScore,
  maxScore,
  onConfirm,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  answeredCount: number;
  total: number;
  /** Номера вопросов без ответа (1-based), для подсказки. */
  unansweredIndexes: number[];
  minScore: number;
  maxScore: number;
  onConfirm: () => void;
  pending?: boolean;
}) {
  const unanswered = total - answeredCount;
  const canSubmit = unanswered === 0;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Отправить тест на проверку?"
      description="Убедитесь, что ответили на все вопросы. После отправки изменить ответы нельзя."
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            Вернуться к вопросам
          </Button>
          <Button
            type="button"
            variant="primary"
            className="w-full sm:w-auto"
            loading={pending}
            disabled={!canSubmit}
            onClick={onConfirm}
          >
            Отправить ответы
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div
          className="flex gap-3 rounded-xl border border-warning/30 bg-warning/8 px-4 py-3 text-sm text-muted-foreground"
          role="note"
        >
          <AlertTriangle className="size-5 shrink-0 text-warning" aria-hidden />
          <p className="text-pretty">
            Проверка выполняется на сервере. Результат, разбор ошибок и рекомендации появятся сразу после проверки. При
            успешной сдаче откроется практика модуля.
          </p>
        </div>

        <ul className="space-y-2 text-sm">
          <li className="flex justify-between gap-2">
            <span className="text-muted-foreground">Отвечено</span>
            <span className="font-semibold tabular-nums text-foreground">
              {answeredCount} / {total}
            </span>
          </li>
          <li className="flex justify-between gap-2">
            <span className="text-muted-foreground">Проходной балл</span>
            <span className="font-medium text-foreground">{formatPassingScore(minScore, maxScore)}</span>
          </li>
        </ul>

        {unanswered > 0 ? (
          <div className="rounded-xl border border-danger/30 bg-danger/8 px-4 py-3 text-sm">
            <p className="font-medium text-danger">
              Без ответа: {unanswered} {unanswered === 1 ? "вопрос" : unanswered < 5 ? "вопроса" : "вопросов"}
            </p>
            {unansweredIndexes.length > 0 ? (
              <p className="mt-1 text-muted-foreground">
                Номера:{" "}
                <span className="font-mono font-medium text-foreground">{unansweredIndexes.join(", ")}</span>
              </p>
            ) : null}
            <p className="mt-2 text-muted-foreground">Заполните все вопросы, чтобы отправить тест.</p>
          </div>
        ) : (
          <p className="rounded-xl border border-success/30 bg-success/8 px-4 py-3 text-sm text-success">
            Все вопросы заполнены — можно отправлять на проверку.
          </p>
        )}
      </div>
    </Modal>
  );
}
