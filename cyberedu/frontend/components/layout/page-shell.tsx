import * as React from "react";
import { cn } from "@/lib/utils";

export type PageShellProps = {
  children: React.ReactNode;
  className?: string;
  /** Вертикальный ритм между крупными блоками лендинга */
  spacing?: "default" | "tight" | "loose";
  as?: "div" | "main";
};

const spacingClass: Record<NonNullable<PageShellProps["spacing"]>, string> = {
  tight: "gap-12 sm:gap-16",
  default: "gap-16 sm:gap-20 lg:gap-24",
  loose: "gap-20 sm:gap-24 lg:gap-28",
};

/** Единая вертикальная сетка для маркетинговых страниц (выравнивание с `container-page`). */
export function PageShell({ children, className, spacing = "default", as: Comp = "div" }: PageShellProps) {
  return <Comp className={cn("flex min-w-0 flex-col", spacingClass[spacing], className)}>{children}</Comp>;
}
