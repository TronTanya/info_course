import * as React from "react";
import { cn } from "@/lib/utils";

export type PracticeLabLayoutProps = {
  breadcrumb?: React.ReactNode;
  /** Заголовок лаборатории (название задания, статусы) */
  header: React.ReactNode;
  main: React.ReactNode;
  aside: React.ReactNode;
  className?: string;
};

/**
 * Двухколоночная лаборатория: общая оболочка, шапка в стиле продукта (secondary + cyan),
 * основная колонка и боковая панель с тем же `practice-layout`, что и в глобальных стилях.
 */
export function PracticeLabLayout({ breadcrumb, header, main, aside, className }: PracticeLabLayoutProps) {
  return (
    <div className={cn("lab-shell min-w-0 overflow-x-clip", className)}>
      <header className="lab-shell-header px-4 py-5 sm:px-6 sm:py-6">
        {breadcrumb ? <div className="min-w-0">{breadcrumb}</div> : null}
        <div className={breadcrumb ? "mt-4" : ""}>{header}</div>
      </header>
      <div className="lab-main-surface practice-layout min-w-0 p-4 sm:p-6">
        <div className="practice-layout-main min-w-0">{main}</div>
        <aside className="practice-layout-aside min-w-0 space-y-5 lg:sticky lg:top-4 lg:self-start">{aside}</aside>
      </div>
    </div>
  );
}
