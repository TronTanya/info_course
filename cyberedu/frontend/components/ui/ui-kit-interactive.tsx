"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function UiKitInteractive() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-wrap gap-3">
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        Открыть модальное окно
      </Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Пример модального окна"
        description="Используется Radix Dialog с токенами дизайн-системы."
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="button" onClick={() => setOpen(false)}>
              Понятно
            </Button>
          </>
        }
      >
        <p className="text-muted-foreground">
          Карточки, кнопки и отступы согласованы с остальной платформой. Закрытие по клику вне области или кнопке.
        </p>
      </Modal>
    </div>
  );
}
