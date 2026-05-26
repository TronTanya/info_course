"use client";

import { useEffect, useState, type RefObject } from "react";
import { cn } from "@/lib/utils";

export function useLessonReadingProgress(
  contentRef: RefObject<HTMLElement | null>,
  lessonCompleted: boolean,
): number {
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    if (lessonCompleted) return;

    const update = () => {
      const el = contentRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const height = el.offsetHeight;
      if (height <= 0) return;
      const viewportBottom = window.scrollY + window.innerHeight - 96;
      const read = Math.min(height, Math.max(0, viewportBottom - top));
      setScrollPercent(Math.min(100, Math.max(0, Math.round((read / height) * 100))));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
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

  return (
    <div className={cn("space-y-1.5", className)} aria-label="Прогресс чтения урока">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>Прогресс чтения</span>
        <span className="font-medium tabular-nums text-foreground">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted/60">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-out",
            lessonCompleted || value >= 90 ? "bg-success" : "bg-primary",
          )}
          style={{ width: `${value}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
