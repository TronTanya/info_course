"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
} from "react";
import { ChevronDown, ListTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLessonSectionReads } from "@/components/lesson/lesson-section-nav";
import type { LessonOutlineItem } from "@/lib/lesson-outline-ui";
import { isLessonDocumentScroll } from "@/lib/scroll-container";
import { scrollElementWithinNearestContainer } from "@/lib/scroll-into-container";
import { cn } from "@/lib/utils";

export type LessonOutlinePlacement = "combined" | "sidebar" | "inline";

export type LessonOutlineProps = {
  items: LessonOutlineItem[];
  containerRef: RefObject<HTMLElement | null>;
  /** sidebar — desktop (в sticky-колонке); inline — collapsible на mobile */
  placement?: LessonOutlinePlacement;
  className?: string;
};

function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduce;
}

function scrollToSection(
  containerRef: RefObject<HTMLElement | null>,
  id: string,
  reduceMotion: boolean,
) {
  const el = containerRef.current?.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
  if (!el) return;

  if (isLessonDocumentScroll()) {
    const top = el.getBoundingClientRect().top + window.scrollY - 12;
    window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? "auto" : "smooth" });
  } else {
    el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }
  if (typeof history !== "undefined" && history.replaceState) {
    history.replaceState(null, "", `#${id}`);
  } else {
    window.location.hash = id;
  }
  if (!el.hasAttribute("tabindex")) {
    el.setAttribute("tabindex", "-1");
  }
  el.focus({ preventScroll: true });
}

export function LessonOutline({
  items,
  containerRef,
  placement = "combined",
  className,
}: LessonOutlineProps) {
  const panelId = useId();
  const navRef = useRef<HTMLUListElement>(null);
  const sectionIds = useMemo(() => items.map((i) => i.id), [items]);
  const { activeId, readIds } = useLessonSectionReads(containerRef, sectionIds);
  const reduceMotion = usePrefersReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollActiveLinkIntoView = useCallback(
    (id: string) => {
      const link = navRef.current?.querySelector<HTMLAnchorElement>(`[data-outline-id="${id}"]`);
      if (!link) return;
      scrollElementWithinNearestContainer(link, {
        behavior: reduceMotion ? "auto" : "smooth",
      });
    },
    [reduceMotion],
  );

  useEffect(() => {
    if (!activeId) return;
    scrollActiveLinkIntoView(activeId);
  }, [activeId, scrollActiveLinkIntoView]);

  if (items.length === 0) return null;

  const list = (
    <OutlineList
      ref={navRef}
      items={items}
      activeId={activeId}
      readIds={readIds}
      containerRef={containerRef}
      reduceMotion={reduceMotion}
      className="min-w-0"
    />
  );

  const showMobile = placement === "combined" || placement === "inline";
  const showSidebar = placement === "combined" || placement === "sidebar";

  return (
    <div className={cn("ce-lesson-outline min-w-0", className)}>
      {showMobile ? (
        <div className="ce-lesson-outline__mobile min-w-0 rounded-xl border border-border/60 bg-card/95 lg:hidden">
          <Button
            type="button"
            variant="ghost"
            className="flex h-12 min-h-12 w-full items-center justify-between gap-2 rounded-xl px-3 py-3 text-sm font-medium text-foreground touch-manipulation"
            aria-expanded={mobileOpen}
            aria-controls={`${panelId}-mobile-nav`}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span className="inline-flex items-center gap-2">
              <ListTree className="size-4 text-primary" aria-hidden />
              Содержание урока
            </span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none",
                mobileOpen && "rotate-180",
              )}
              aria-hidden
            />
          </Button>
          {mobileOpen ? (
            <nav
              id={`${panelId}-mobile-nav`}
              className="border-t border-border/60 px-2 py-2"
              aria-label="Оглавление урока"
            >
              {list}
            </nav>
          ) : null}
        </div>
      ) : null}

      {showSidebar ? (
        <nav
          className={cn(
            "ce-lesson-outline__desktop hidden lg:block",
            placement === "sidebar" && "lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)]",
          )}
          aria-labelledby={`${panelId}-label`}
        >
          <p
            id={`${panelId}-label`}
            className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary"
          >
            Оглавление
          </p>
          <div className="mt-2 max-h-[min(14rem,40vh)] overflow-y-auto overscroll-contain pr-0.5">
            {list}
          </div>
        </nav>
      ) : null}
    </div>
  );
}

type OutlineListProps = {
  items: LessonOutlineItem[];
  activeId: string | null;
  readIds: Set<string>;
  containerRef: RefObject<HTMLElement | null>;
  reduceMotion: boolean;
  className?: string;
};

const OutlineList = forwardRef<HTMLUListElement, OutlineListProps>(function OutlineList(
  { items, activeId, readIds, containerRef, reduceMotion, className },
  ref,
) {
  function jumpTo(id: string, event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    scrollToSection(containerRef, id, reduceMotion);
  }

  function onLinkKeyDown(event: KeyboardEvent<HTMLAnchorElement>, id: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      scrollToSection(containerRef, id, reduceMotion);
    }
  }

  return (
    <ul ref={ref} className={cn("flex flex-col gap-0.5", className)}>
      {items.map((item) => {
        const isActive = activeId === item.id;
        const isRead = readIds.has(item.id);
        const padding =
          item.depth === 2 ? "pl-5" : item.depth === 1 ? "pl-2" : "pl-0";

        return (
          <li key={item.id} className={cn("min-w-0", padding)}>
            <a
              href={`#${item.id}`}
              data-outline-id={item.id}
              onClick={(e) => jumpTo(item.id, e)}
              onKeyDown={(e) => onLinkKeyDown(e, item.id)}
              aria-current={isActive ? "location" : undefined}
              className={cn(
                "block min-h-9 rounded-lg border px-2.5 py-2 text-left text-sm transition-colors motion-reduce:transition-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isActive
                  ? "border-primary/35 bg-primary/10 font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:border-primary/20 hover:bg-muted/30 hover:text-foreground",
                item.kind === "content" && item.depth === 2 && "text-xs",
                item.kind === "static" && "font-medium",
              )}
            >
              <span className="line-clamp-2 leading-snug">{item.label}</span>
              {isRead && !isActive ? (
                <span className="sr-only"> — просмотрено</span>
              ) : null}
            </a>
          </li>
        );
      })}
    </ul>
  );
});
