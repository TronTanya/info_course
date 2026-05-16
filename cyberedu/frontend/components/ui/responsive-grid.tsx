import * as React from "react";
import { cn } from "@/lib/utils";

export type ResponsiveGridProps = {
  children: React.ReactNode;
  className?: string;
};

/** Сетка карточек курса / каталогов: 1 → 2 → 3 колонки (см. `responsive-card-grid` в globals). */
export function ResponsiveGrid({ children, className }: ResponsiveGridProps) {
  return <div className={cn("responsive-card-grid", className)}>{children}</div>;
}
