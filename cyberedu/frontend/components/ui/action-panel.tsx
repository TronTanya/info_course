import * as React from "react";
import { cn } from "@/lib/utils";

export type ActionPanelProps = {
  children: React.ReactNode;
  className?: string;
  /** Закрепить внизу экрана на мобильных (например, сохранение формы) */
  sticky?: boolean;
};

/** Панель действий: выравнивание кнопок, единый фон и отступы. */
export function ActionPanel({ children, className, sticky }: ActionPanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border/80 bg-card/95 p-4 shadow-sm ring-1 ring-inset ring-white/30 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4",
        sticky && "max-md:sticky max-md:bottom-3 max-md:z-20 max-md:backdrop-blur-md",
        className,
      )}
    >
      {children}
    </div>
  );
}
