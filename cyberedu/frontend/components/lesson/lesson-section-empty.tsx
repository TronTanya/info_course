import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { CircleHelp, FileText, Target } from "lucide-react";
import {
  LESSON_SECTION_EMPTY,
  type LessonSectionEmptyKind,
} from "@/lib/lesson-page-state";
import { cn } from "@/lib/utils";

const SECTION_ICONS: Record<LessonSectionEmptyKind, LucideIcon> = {
  objectives: Target,
  key_terms: FileText,
  checkpoint: CircleHelp,
};

export type LessonSectionEmptyProps = {
  kind: LessonSectionEmptyKind;
  className?: string;
  /** id заголовка для aria-labelledby родительской секции */
  headingId?: string;
  footer?: ReactNode;
};

export function LessonSectionEmpty({ kind, className, headingId, footer }: LessonSectionEmptyProps) {
  const copy = LESSON_SECTION_EMPTY[kind];
  const Icon = SECTION_ICONS[kind];

  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-5",
        className,
      )}
      role="status"
      aria-labelledby={headingId}
    >
      <div className="flex gap-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-muted/30 text-muted-foreground"
          aria-hidden
        >
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{copy.title}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{copy.message}</p>
          {footer ? <div className="mt-2">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
