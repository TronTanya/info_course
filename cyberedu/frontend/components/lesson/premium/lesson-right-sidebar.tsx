import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type LessonRightSidebarProps = {
  outline: ReactNode;
  mentor: ReactNode;
  progress?: ReactNode;
  className?: string;
};

/** Правая sticky-панель desktop: оглавление → наставник → прогресс. */
export function LessonRightSidebar({ outline, mentor, progress, className }: LessonRightSidebarProps) {
  return (
    <div className={cn("ce-lesson-right-sidebar flex flex-col gap-2.5", className)}>
      <div className="ce-glass rounded-xl border border-border/70 p-3">{outline}</div>
      {mentor}
      {progress ? (
        <div className="ce-glass rounded-xl border border-border/70 p-3">{progress}</div>
      ) : null}
    </div>
  );
}
