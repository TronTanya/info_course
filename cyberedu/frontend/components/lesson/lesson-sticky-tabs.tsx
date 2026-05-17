"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type TabKey = "original" | "ai" | "summary";

export function LessonStickyTabs({
  value,
  onValueChange,
  original,
  ai,
  summary,
}: {
  value: TabKey;
  onValueChange: (v: TabKey) => void;
  original: ReactNode;
  ai: ReactNode;
  summary: ReactNode;
}) {
  const reduce = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    function onScroll() {
      const node = contentRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const viewport = window.innerHeight;
      const total = node.scrollHeight - viewport;
      if (total <= 0) {
        setReadProgress(100);
        return;
      }
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      setReadProgress(Math.round((scrolled / total) * 100));
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [value]);

  return (
    <div ref={contentRef} className="lesson-prose w-full space-y-3">
      <Tabs value={value} onValueChange={(v) => onValueChange(v as TabKey)} className="w-full">
        <div className="sticky top-[4.5rem] z-20 -mx-1 space-y-2 rounded-xl border border-border/60 bg-card/95 p-1.5 shadow-md backdrop-blur-md sm:top-20">
          <div className="flex items-center justify-between gap-2 px-2 pt-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Материал</span>
            <span className="font-mono text-[10px] tabular-nums text-cyan">{readProgress}%</span>
          </div>
          <div
            className="h-1 overflow-hidden rounded-full bg-muted/60"
            role="progressbar"
            aria-valuenow={readProgress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <motion.div
              className="h-full rounded-full bg-linear-to-r from-primary via-cyan to-primary"
              initial={false}
              animate={{ width: `${readProgress}%` }}
              transition={reduce ? { duration: 0 } : { duration: 0.25 }}
            />
          </div>
          <TabsList className="flex h-auto w-full min-h-11 snap-x snap-mandatory gap-1 overflow-x-auto border-0 bg-transparent p-0 shadow-none ring-0 [-webkit-overflow-scrolling:touch] sm:grid sm:grid-cols-3 sm:overflow-visible">
            <TabsTrigger value="original" className="min-w-[7.5rem] shrink-0 snap-start sm:min-w-0">
              Оригинал
            </TabsTrigger>
            <TabsTrigger value="ai" className="min-w-[7.5rem] shrink-0 snap-start sm:min-w-0">
              AI-объяснение
            </TabsTrigger>
            <TabsTrigger value="summary" className="min-w-[7.5rem] shrink-0 snap-start sm:min-w-0">
              Конспект
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="original" className={cn("ce-learn-panel mt-3 space-y-6 rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6")}>
          {original}
        </TabsContent>
        <TabsContent value="ai" className="ce-learn-panel mt-3 space-y-5 rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
          {ai}
        </TabsContent>
        <TabsContent value="summary" className="ce-learn-panel mt-3 space-y-5 rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
          {summary}
        </TabsContent>
      </Tabs>
    </div>
  );
}
