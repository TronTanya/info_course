"use client";

import { useEffect, useState, type RefObject } from "react";
import { LESSON_READING_PROGRESS_LABEL_ID } from "@/lib/lesson-page-a11y";
import { getScrollParent, subscribeScroll } from "@/lib/scroll-container";
import { cn } from "@/lib/utils";

export function useLessonReadingProgress(
  contentRef: RefObject<HTMLElement | null>,
  lessonCompleted: boolean,
): number {
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    if (lessonCompleted) return;

    const el = contentRef.current;
    if (!el) return;

    const scrollTarget = getScrollParent(el);

    const update = () => {
      const node = contentRef.current;
      if (!node) return;
      const height = node.offsetHeight;
      if (height <= 0) return;

      if (scrollTarget === window) {
        const rect = node.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        const viewportBottom = window.scrollY + window.innerHeight - 96;
        const read = Math.min(height, Math.max(0, viewportBottom - top));
        setScrollPercent(Math.min(100, Math.max(0, Math.round((read / height) * 100))));
        return;
      }

      const rootRect = scrollTarget.getBoundingClientRect();
      const nodeRect = node.getBoundingClientRect();
      const read = Math.min(
        height,
        Math.max(0, rootRect.bottom - 96 - nodeRect.top),
      );
      setScrollPercent(Math.min(100, Math.max(0, Math.round((read / height) * 100))));
    };

    update();
    const offScroll = subscribeScroll(scrollTarget, update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      offScroll();
      window.removeEventListener("resize", update);
    };
  }, [contentRef, lessonCompleted]);

  return lessonCompleted ? 100 : scrollPercent;
}

export function LessonReadingProgressBar({
  percent,
  lessonCompleted,
  className,
}: {
  percent: number;
  lessonCompleted: boolean;
  className?: string;
}) {
  const value = lessonCompleted ? 100 : percent;

  const valueText = lessonCompleted ? "Урок прочитан" : `Прочитано ${value} процентов`;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span id={LESSON_READING_PROGRESS_LABEL_ID}>Прогресс чтения</span>
        <span className="font-medium tabular-nums text-foreground" aria-hidden>
          {value}%
        </span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted/60 ring-1 ring-inset ring-border/50"
        role="progressbar"
        aria-labelledby={LESSON_READING_PROGRESS_LABEL_ID}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={valueText}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300 ease-out motion-reduce:transition-none",
            lessonCompleted || value >= 90 ? "bg-success" : "bg-primary",
          )}
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="sr-only">{valueText}</p>
    </div>
  );
}
