import * as React from "react";
import { glassVariants } from "@/lib/design-system/components";
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
        glassVariants.surfaceElevated,
        "flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4",
        sticky && "max-md:sticky max-md:bottom-3 max-md:z-20",
        className,
      )}
    >
      {children}
    </div>
  );
}
