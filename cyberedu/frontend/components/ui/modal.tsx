"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { modalVariants } from "@/lib/design-system/components";
import { transitionBase } from "@/lib/design-system/primitives";
import { typography } from "@/lib/design-system/tokens";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function Modal({ open, onOpenChange, title, description, children, footer }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            modalVariants.overlay,
            transitionBase,
            "data-[state=open]:animate-[ds-fade-in_0.28s_var(--ease-out-expo)_forwards] data-[state=closed]:opacity-0 motion-reduce:animate-none",
          )}
        />
        <Dialog.Content className={cn(modalVariants.content, "outline-hidden motion-reduce:animate-none")}>
          <div className="flex flex-col gap-2">
            <Dialog.Title className={modalVariants.title}>{title}</Dialog.Title>
            {description ? (
              <Dialog.Description className={cn(typography.caption)}>{description}</Dialog.Description>
            ) : (
              <Dialog.Description className="sr-only">Диалоговое окно</Dialog.Description>
            )}
          </div>
          <div className={cn(typography.body, "mt-4 text-sm")}>{children}</div>
          {footer ? (
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">{footer}</div>
          ) : (
            <div className="mt-6 flex justify-end">
              <Dialog.Close asChild>
                <Button type="button" variant="secondary" className="w-full sm:w-auto">
                  Закрыть
                </Button>
              </Dialog.Close>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
