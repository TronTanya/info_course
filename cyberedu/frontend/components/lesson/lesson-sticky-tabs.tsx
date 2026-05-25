"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getScrollParent, subscribeScroll } from "@/lib/scroll-container";
import { cn } from "@/lib/utils";

type TabKey = "original" | "ai" | "summary";

export function LessonStickyTabs({
  value,
  onValueChange,
  original,
  ai,
  summary,
  showAiTabs = true,
  busy = false,
}: {
  value: TabKey;
  onValueChange: (v: TabKey) => void;
  original: ReactNode;
  ai: ReactNode;
  summary: ReactNode;
  /** Скрыть вкладки AI, если адаптация отключена для лекции */
  showAiTabs?: boolean;
  busy?: boolean;
}) {
  const reduce = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const scrollTarget = getScrollParent(el);

    function onScroll() {
      const node = contentRef.current;
      if (!node) return;

      if (scrollTarget === window) {
        const rect = node.getBoundingClientRect();
        const viewport = window.innerHeight;
        const total = node.scrollHeight - viewport;
        if (total <= 0) {
          setReadProgress(100);
          return;
        }
        const scrolled = Math.min(Math.max(-rect.top, 0), total);
        setReadProgress(Math.round((scrolled / total) * 100));
        return;
      }

      const rootRect = scrollTarget.getBoundingClientRect();
      const nodeRect = node.getBoundingClientRect();
      const viewport = rootRect.height;
      const total = nodeRect.height - viewport;
      if (total <= 0) {
        setReadProgress(100);
        return;
      }
      const scrolled = Math.min(Math.max(rootRect.top - nodeRect.top, 0), total);
      setReadProgress(Math.round((scrolled / total) * 100));
    }

    onScroll();
    return subscribeScroll(scrollTarget, onScroll, { passive: true });
  }, [value]);

  return (
    <div ref={contentRef} className="lesson-prose min-w-0 w-full max-w-full space-y-3 overflow-x-clip">
      <Tabs value={value} onValueChange={(v) => onValueChange(v as TabKey)} className="w-full min-w-0">
        <div className="ce-lesson-sticky-tabs space-y-2 rounded-xl border border-border/60 bg-card/95 p-1.5 shadow-sm max-lg:relative max-lg:top-auto max-lg:z-0 lg:sticky lg:top-[calc(var(--header-height,4.25rem)+0.5rem)] lg:z-20 lg:shadow-md lg:backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 px-2 pt-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Материал</span>
            <span className="font-mono text-[10px] tabular-nums text-cyan" aria-hidden>
              {readProgress}%
            </span>
          </div>
          <div
            className="h-1 overflow-hidden rounded-full bg-muted/60 ring-1 ring-inset ring-border/40"
            role="progressbar"
            aria-label="Прогресс прокрутки материала"
            aria-valuenow={readProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={`Прокручено ${readProgress} процентов`}
          >
            <motion.div
              className="h-full rounded-full bg-linear-to-r from-primary via-cyan to-primary"
              initial={false}
              animate={{ width: `${readProgress}%` }}
              transition={reduce ? { duration: 0 } : { duration: 0.25 }}
            />
          </div>
          <TabsList
            className={cn(
              "grid h-auto w-full min-h-11 gap-1 border-0 bg-transparent p-0 shadow-none ring-0",
              showAiTabs ? "grid-cols-3" : "grid-cols-1",
            )}
            aria-label="Вкладки материала"
          >
            <TabsTrigger
              value="original"
              className="min-h-11 min-w-0 px-2 text-xs touch-manipulation sm:text-sm"
              disabled={busy && value !== "original"}
              title={busy && value !== "original" ? "Подождите, идёт генерация AI" : undefined}
            >
              Материал
            </TabsTrigger>
            {showAiTabs ? (
              <>
                <TabsTrigger
                  value="ai"
                  className="min-h-11 min-w-0 px-1.5 text-[11px] touch-manipulation min-[390px]:px-2 min-[390px]:text-xs sm:text-sm"
                  disabled={busy && value !== "ai"}
                  title={busy && value !== "ai" ? "Подождите, идёт генерация AI" : undefined}
                >
                  <span className="min-[390px]:hidden">AI</span>
                  <span className="hidden min-[390px]:inline">AI-объяснение</span>
                </TabsTrigger>
                <TabsTrigger
                  value="summary"
                  className="min-h-11 min-w-0 px-1.5 text-[11px] touch-manipulation min-[390px]:px-2 min-[390px]:text-xs sm:text-sm"
                  disabled={busy && value !== "summary"}
                  title={busy && value !== "summary" ? "Подождите, идёт генерация AI" : undefined}
                >
                  Конспект
                </TabsTrigger>
              </>
            ) : null}
          </TabsList>
        </div>

        <TabsContent
          value="original"
          className={cn("ce-learn-panel ce-glass mt-3 min-w-0 space-y-6 overflow-x-clip rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-6")}
        >
          {original}
        </TabsContent>
        <TabsContent
          value="ai"
          className="ce-learn-panel ce-glass mt-3 min-w-0 space-y-4 overflow-x-clip rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-6"
        >
          {ai}
        </TabsContent>
        <TabsContent
          value="summary"
          className="ce-learn-panel ce-glass mt-3 min-w-0 space-y-4 overflow-x-clip rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-6"
        >
          {summary}
        </TabsContent>
      </Tabs>
    </div>
  );
}
