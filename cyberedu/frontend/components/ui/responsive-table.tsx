import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Горизонтальный скролл таблицы только внутри блока — не на всей странице. */
export function ResponsiveTable({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn("ce-admin-table-scroll ce-scroll-x-contained -mx-1 min-w-0 px-1", className)}
      tabIndex={0}
      role="region"
      aria-label="Таблица с горизонтальной прокруткой"
    >
      {children}
    </div>
  );
}
