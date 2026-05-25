import Link from "next/link";
import { ArrowRight, BookOpen, Lightbulb, ListChecks, ShieldAlert, Sparkles } from "lucide-react";
import {
  buildLessonContentLegendItems,
  type LessonContentLegendItem,
} from "@/lib/lesson-content-legend";
import type { LearningStepLink } from "@/lib/learning-nav";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const LEGEND_ICONS: Partial<Record<LessonContentLegendItem["key"], typeof BookOpen>> = {
  theory: BookOpen,
  example: Sparkles,
  warning: ShieldAlert,
  checklist: ListChecks,
  intro: Lightbulb,
};

export type LessonIntroPanelProps = {
  goal: string | null;
  keyIdeas: string[];
  lessonContent: string;
  lessonCompleted: boolean;
  nextStep: LearningStepLink | null;
  className?: string;
};

function formatNextStepHint(next: LearningStepLink | null, lessonCompleted: boolean): string | null {
  if (!next || next.disabled) return null;
  if (!lessonCompleted) {
    return "После чтения отметьте урок изученным — откроется тест и следующие шаги модуля.";
  }
  if (next.href.includes("/test")) return "Следующий шаг — контрольный тест по модулю.";
  if (next.href.includes("/practice")) return "Закрепите тему в практической лаборатории.";
  return next.hint ?? next.label;
}

function LegendChip({ item }: { item: LessonContentLegendItem }) {
  const Icon = LEGEND_ICONS[item.key] ?? BookOpen;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/25 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
      <Icon className="size-3.5 shrink-0 text-primary" aria-hidden />
      {item.label} · {item.count}
    </span>
  );
}

export function LessonIntroPanel({
  goal,
  keyIdeas,
  lessonContent,
  lessonCompleted,
  nextStep,
  className,
}: LessonIntroPanelProps) {
  const legendItems = buildLessonContentLegendItems(lessonContent);
  const previewIdeas = keyIdeas.slice(0, 4);
  const nextHint = formatNextStepHint(nextStep, lessonCompleted);
  const hasLegend = legendItems.length > 0;

  if (!goal && previewIdeas.length === 0 && !hasLegend && !nextHint) return null;

  return (
    <section
      className={cn(
        "ce-lesson-intro rounded-2xl border border-border/70 bg-linear-to-br from-card via-card to-primary/[0.04] p-5 shadow-sm ring-1 ring-inset ring-border/50 sm:p-6",
        className,
      )}
      aria-labelledby="lesson-intro-heading"
    >
      <p id="lesson-intro-heading" className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
        Обзор урока
      </p>

      {goal ? (
        <div className="mt-3 space-y-1">
          <h2 className="text-sm font-semibold text-foreground">Зачем этот урок</h2>
          <p className="max-w-prose text-pretty text-[15px] leading-relaxed text-muted-foreground">{goal}</p>
        </div>
      ) : null}

      {previewIdeas.length > 0 ? (
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Ключевые понятия</h3>
          <ul className="flex flex-wrap gap-2" aria-label="Ключевые понятия урока">
            {previewIdeas.map((idea) => (
              <li key={idea}>
                <Badge variant="outline" className="max-w-[20rem] truncate font-normal text-foreground/90">
                  {idea.length > 72 ? `${idea.slice(0, 69)}…` : idea}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasLegend ? (
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Типы блоков в материале">
          {legendItems.map((item) => (
            <LegendChip key={item.key} item={item} />
          ))}
        </div>
      ) : null}

      {nextHint ? (
        <div className="mt-4 flex flex-col gap-2 rounded-xl border border-primary/20 bg-primary/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-foreground/90">
            <span className="font-medium text-foreground">Что дальше: </span>
            {nextHint}
          </p>
          {nextStep && !nextStep.disabled && lessonCompleted ? (
            <Link
              href={nextStep.href}
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {nextStep.label}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
