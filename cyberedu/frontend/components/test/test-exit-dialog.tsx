"use client";

import { LogOut } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export function TestExitDialog({
  open,
  onOpenChange,
  answeredCount,
  total,
  onConfirmExit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  answeredCount: number;
  total: number;
  onConfirmExit: () => void;
}) {
  const hasAnswers = answeredCount > 0;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Выйти из теста?"
      description={
        hasAnswers
          ? "Ответы сохранены в браузере, но прогресс не отправлен на проверку."
          : "Вы вернётесь к экрану перед началом теста."
      }
      footer={
        <>
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
            Продолжить тест
          </Button>
          <Button type="button" variant="danger" className="w-full gap-2 sm:w-auto" onClick={onConfirmExit}>
            <LogOut className="size-4" aria-hidden />
            Выйти
          </Button>
        </>
      }
    >
      {hasAnswers ? (
        <p className="text-sm text-muted-foreground">
          Отвечено <span className="font-semibold tabular-nums text-foreground">{answeredCount}</span> из {total}. При
          выходе можно начать заново — черновик будет сброшен.
        </p>
      ) : null}
    </Modal>
  );
}
