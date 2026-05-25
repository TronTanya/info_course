"use client";

import { useCallback, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { LandingFaqItem } from "@/lib/landing-content";
import { cn } from "@/lib/utils";

type LandingFaqAccordionProps = {
  items: LandingFaqItem[];
};

export function LandingFaqAccordion({ items }: LandingFaqAccordionProps) {
  const baseId = useId();
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set());
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const toggle = useCallback((index: number) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const focusItem = useCallback((index: number) => {
    buttonRefs.current[index]?.focus();
  }, []);

  const handleTriggerKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      const last = items.length - 1;
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          focusItem(index === last ? 0 : index + 1);
          break;
        case "ArrowUp":
          event.preventDefault();
          focusItem(index === 0 ? last : index - 1);
          break;
        case "Home":
          event.preventDefault();
          focusItem(0);
          break;
        case "End":
          event.preventDefault();
          focusItem(last);
          break;
        default:
          break;
      }
    },
    [focusItem, items.length],
  );

  return (
    <div className="mx-auto max-w-3xl space-y-3" role="group" aria-label="Вопросы и ответы">
      {items.map((item, index) => {
        const isOpen = open.has(index);
        const triggerId = `${baseId}-trigger-${index}`;
        const panelId = `${baseId}-panel-${index}`;

        return (
          <div
            key={item.q}
            className={cn(
              "ce-glass ce-landing-glass-tile rounded-2xl border transition-[border-color,box-shadow] duration-200",
              isOpen ? "border-primary/22 shadow-card-hover" : "border-border/80 hover:border-primary/18",
            )}
          >
            <h3 className="m-0">
              <button
                ref={(el) => {
                  buttonRefs.current[index] = el;
                }}
                id={triggerId}
                type="button"
                className={cn(
                  "flex w-full min-h-11 items-center justify-between gap-4 rounded-2xl px-4 py-4 text-left sm:px-5",
                  "text-sm font-semibold text-foreground touch-manipulation",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
                onKeyDown={(event) => handleTriggerKeyDown(event, index)}
              >
                <span className="text-pretty">{item.q}</span>
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-card/80 text-primary transition-transform duration-200",
                    isOpen && "rotate-180",
                  )}
                  aria-hidden
                >
                  <ChevronDown className="size-4" strokeWidth={2} />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              hidden={!isOpen}
              inert={!isOpen ? true : undefined}
              className="border-t border-border/50 px-4 pb-4 sm:px-5"
            >
              <p className="pt-3 text-sm leading-relaxed text-pretty text-muted-foreground">{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
