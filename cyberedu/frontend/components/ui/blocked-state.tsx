import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Сообщение о недоступности действия (ожидание проверки, блокировка). */
export function BlockedState({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("ce-blocked-state", className)} role="status">
      {children}
    </div>
  );
}
