import {
  BookOpen,
  Lightbulb,
  ListChecks,
  ShieldAlert,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { LessonContentLegendItem, LessonContentLegendKey } from "@/lib/lesson-content-legend";
import { cn } from "@/lib/utils";

const LEGEND_ICONS: Record<LessonContentLegendKey, LucideIcon> = {
  intro: Sparkles,
  theory: BookOpen,
  example: Lightbulb,
  warning: ShieldAlert,
  checklist: ListChecks,
  remember: BookOpen,
  term: BookOpen,
};

const LEGEND_TONE: Record<LessonContentLegendKey, string> = {
  intro: "border-cyan/30 bg-cyan/8 text-cyan",
  theory: "border-primary/25 bg-primary/8 text-primary",
  example: "border-violet-500/30 bg-violet-500/8 text-violet-600 dark:text-violet-400",
  warning: "border-warning/35 bg-warning/10 text-warning",
  checklist: "border-success/30 bg-success/8 text-success",
  remember: "border-primary/20 bg-muted/30 text-foreground",
  term: "border-border/80 bg-muted/25 text-muted-foreground",
};

export type LessonContentLegendProps = {
  items: LessonContentLegendItem[];
  className?: string;
};

export function LessonContentLegend({ items, className }: LessonContentLegendProps) {
  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "ce-lesson-content-legend rounded-xl border border-border/60 bg-muted/15 px-3 py-2.5",
        className,
      )}
      role="note"
      aria-label="Типы блоков в материале"
    >
      <p className="text-[11px] font-medium text-muted-foreground">
        В тексте встречаются блоки:
      </p>
      <ul className="mt-2 flex flex-wrap gap-1.5" role="list">
        {items.map((item) => {
          const Icon = LEGEND_ICONS[item.key];
          return (
            <li key={item.key} role="listitem">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
                  LEGEND_TONE[item.key],
                )}
              >
                <Icon className="size-3.5 shrink-0" aria-hidden />
                {item.label}
                <span className="font-mono tabular-nums opacity-80">×{item.count}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
