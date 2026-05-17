import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AppPageShellProps = {
  children: ReactNode;
  className?: string;
  /** Узкая колонка для форм и gate-экранов */
  width?: "default" | "narrow";
  as?: "main" | "div";
};

const widthClass = {
  default: "max-w-6xl",
  narrow: "max-w-lg",
} as const;

/** Обёртка контента кабинета / админки: ритм, overflow, max-width. */
export function AppPageShell({
  children,
  className,
  width = "default",
  as: Comp = "div",
}: AppPageShellProps) {
  return (
    <Comp className={cn("mx-auto min-w-0 space-y-8 overflow-x-hidden pb-6", widthClass[width], className)}>
      {children}
    </Comp>
  );
}
