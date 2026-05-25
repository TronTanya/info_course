"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { LessonSectionNavItem } from "@/lib/lesson-section-nav";
import { LESSON_SECTION_KIND_LABELS } from "@/lib/lesson-section-nav";
import { isLessonDocumentScroll } from "@/lib/scroll-container";
import { scrollElementWithinNearestContainer } from "@/lib/scroll-into-container";
import { cn } from "@/lib/utils";

export type LessonSectionNavProps = {
  items: LessonSectionNavItem[];
  containerRef: RefObject<HTMLElement | null>;
  className?: string;
};

export function useLessonSectionReads(
  containerRef: RefObject<HTMLElement | null>,
  sectionIds: string[],
): { activeId: string | null; readIds: Set<string> } {
  const [activeId, setActiveId] = useState<string | null>(sectionIds[0] ?? null);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const root = containerRef.current;
    if (!root || sectionIds.length === 0) return;

    const elements = sectionIds
      .map((id) => root.querySelector<HTMLElement>(`#${CSS.escape(id)}`))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const visible = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (!id) continue;
          if (entry.isIntersecting) {
            visible.set(id, entry.intersectionRatio);
            setReadIds((prev) => {
              if (prev.has(id)) return prev;
              const next = new Set(prev);
              next.add(id);
              return next;
            });
          } else {
            visible.delete(id);
          }
        }

        let bestId: string | null = null;
        let bestRatio = 0;
        for (const [id, ratio] of visible) {
          if (ratio >= bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }
        if (bestId) setActiveId(bestId);
      },
      { root: null, rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.15, 0.4, 0.7] },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef, sectionIds]);

  return { activeId, readIds };
}

export function LessonSectionNav({ items, containerRef, className }: LessonSectionNavProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const sectionIds = items.map((i) => i.id);
  const { activeId, readIds } = useLessonSectionReads(containerRef, sectionIds);

  const scrollLinkIntoView = useCallback((id: string) => {
    const btn = navRef.current?.querySelector<HTMLButtonElement>(`[data-section-id="${id}"]`);
    if (!btn) return;
    scrollElementWithinNearestContainer(btn, { behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (activeId) scrollLinkIntoView(activeId);
  }, [activeId, scrollLinkIntoView]);

  if (items.length < 2) return null;

  const readCount = items.filter((i) => readIds.has(i.id)).length;

  function jumpTo(id: string) {
    const el = containerRef.current?.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    if (!el) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isLessonDocumentScroll()) {
      const top = el.getBoundingClientRect().top + window.scrollY - 12;
      window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? "auto" : "smooth" });
    } else {
      el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }
  }

  return (
    <nav
      className={cn(
        "ce-lesson-section-nav sticky top-[4.25rem] z-10 -mx-1 rounded-xl border border-border/60 bg-card/95 p-2 shadow-md backdrop-blur-md sm:top-20",
        className,
      )}
      aria-label="Содержание урока"
    >
      <div className="flex items-center justify-between gap-2 px-1 pb-1.5">
        <span className="text-xs font-medium text-muted-foreground">Содержание</span>
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
          {readCount}/{items.length}
        </span>
      </div>
      <div
        ref={navRef}
        className="flex gap-1.5 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch]"
        role="list"
      >
        {items.map((item) => {
          const isActive = activeId === item.id;
          const isRead = readIds.has(item.id);
          return (
            <button
              key={item.id}
              type="button"
              data-section-id={item.id}
              role="listitem"
              onClick={() => jumpTo(item.id)}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "inline-flex min-h-9 shrink-0 snap-start flex-col items-start rounded-lg border px-3 py-1.5 text-left transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-border/70 bg-muted/20 text-muted-foreground hover:border-primary/25 hover:text-foreground",
              )}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide text-primary/80">
                {LESSON_SECTION_KIND_LABELS[item.kind]}
              </span>
              <span className="max-w-[11rem] truncate text-xs font-medium">{item.label}</span>
              {isRead ? (
                <span className="sr-only">просмотрено</span>
              ) : (
                <span className="mt-0.5 size-1 rounded-full bg-muted-foreground/40" aria-hidden />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
