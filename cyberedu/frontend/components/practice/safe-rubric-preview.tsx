"use client";

import { ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SafeRubricItem } from "@/types/practice-view-model";

const KIND_LABELS: Record<NonNullable<SafeRubricItem["kind"]>, string> = {
  analysis: "Анализ",
  reasoning: "Аргументация",
  indicators: "Признаки",
  safety: "Безопасность",
  presentation: "Оформление",
  general: "Критерий",
};

function RubricCriterionRow({ item }: { item: SafeRubricItem }) {
  const tag = item.kind ? KIND_LABELS[item.kind] : null;

  return (
    <li className="rounded-xl border border-border/55 bg-background/30 px-4 py-3.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{item.title}</p>
        {tag ? (
          <span className="rounded-md border border-primary/20 bg-primary/8 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary/90">
            {tag}
          </span>
        ) : null}
        {item.points != null && item.points > 0 ? (
          <span className="text-xs text-muted-foreground">ориентир · до {item.points} б.</span>
        ) : null}
      </div>
      {item.description ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
      ) : null}
    </li>
  );
}

export type SafeRubricPreviewProps = {
  items: SafeRubricItem[];
  className?: string;
  /** Скрыть блок, если критериев нет (например, locked practice). */
  hideWhenEmpty?: boolean;
};

/**
 * Безопасный предпросмотр критериев оценки для студента.
 * Без answer key, скрытой rubric и эталонных признаков.
 */
export function SafeRubricPreview({ items, className, hideWhenEmpty = true }: SafeRubricPreviewProps) {
  if (hideWhenEmpty && items.length === 0) return null;

  return (
    <section
      className={cn(
        "ce-safe-rubric-preview ce-glass relative overflow-hidden rounded-2xl",
        "border border-amber-500/15 bg-linear-to-br from-card/88 via-card/75 to-amber-500/[0.04]",
        "shadow-[0_0_24px_-14px_hsl(var(--primary)/0.35)] ring-1 ring-amber-500/10",
        "p-5 sm:p-6",
        className,
      )}
      aria-label="Критерии оценки"
    >
      <div className="relative space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <ClipboardCheck className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600/90 dark:text-amber-400/90">
              Оценка
            </p>
            <h2 className="font-display text-lg font-semibold text-foreground sm:text-xl">Критерии оценки</h2>
            <p className="text-sm text-muted-foreground">
              Ориентиры для самопроверки перед отправкой. Эталонные ответы, regex и скрытая рубрика не
              показываются.
            </p>
          </div>
        </div>

        {items.length > 0 ? (
          <ul className="space-y-2.5" role="list">
            {items.map((item) => (
              <RubricCriterionRow key={item.id} item={item} />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Критерии для этого задания будут доступны после открытия практики.
          </p>
        )}

        <p className="text-xs text-muted-foreground/90">
          Итоговый балл выставляется на сервере или проверяющим по полной рубрике, которая недоступна в
          интерфейсе.
        </p>
      </div>
    </section>
  );
}
