"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export function TestSubmitDialog({
  open,
  onOpenChange,
  answeredCount,
  total,
  onConfirm,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  answeredCount: number;
  total: number;
  onConfirm: () => void;
  pending?: boolean;
}) {
  const unanswered = total - answeredCount;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Завершить тест?"
      description="После отправки изменить ответы будет нельзя. Проверка выполняется на сервере."
      footer={
        <>
          <Button type="button" variant="outline" className="w-full sm:w-auto" disabled={pending} onClick={() => onOpenChange(false)}>
            Вернуться к вопросам
          </Button>
          <Button type="button" variant="primary" className="w-full sm:w-auto" loading={pending} onClick={onConfirm}>
            Отправить ответы
          </Button>
        </>
      }
    >
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li>
          Отвечено: <span className="font-semibold text-foreground">{answeredCount}</span> из {total}
        </li>
        {unanswered > 0 ? (
          <li className="text-warning">
            Без ответа осталось {unanswered} {unanswered === 1 ? "вопрос" : unanswered < 5 ? "вопроса" : "вопросов"} — отправка будет отклонена.
          </li>
        ) : (
          <li className="text-success">Все вопросы заполнены. Можно отправлять.</li>
        )}
      </ul>
    </Modal>
  );
}
