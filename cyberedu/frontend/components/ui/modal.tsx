"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
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
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/70 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[min(100%-2rem,520px)] max-h-[min(90vh,720px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-border/80 bg-popover p-6 text-popover-foreground shadow-[var(--shadow-card-hover)] outline-none ring-1 ring-primary/10 focus-visible:ring-2 focus-visible:ring-ring",
            "data-[state=open]:animate-[ce-modal-in_0.3s_var(--ease-out-expo)_forwards] data-[state=closed]:opacity-0 motion-reduce:animate-none",
          )}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex flex-col gap-2">
            <Dialog.Title className="font-display text-lg font-semibold text-foreground">{title}</Dialog.Title>
            {description ? (
              <Dialog.Description className="text-sm text-muted-foreground">{description}</Dialog.Description>
            ) : null}
          </div>
          <div className="mt-4 text-sm">{children}</div>
          {footer ? (
            <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div>
          ) : (
            <div className="mt-6 flex justify-end">
              <Dialog.Close asChild>
                <Button type="button" variant="secondary">
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
