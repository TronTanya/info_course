"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import type { LessonSelfCheckItem } from "@/lib/lesson-page-ui";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";

export function LessonSelfCheck({ items }: { items: LessonSelfCheckItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (items.length === 0) return null;

  return (
    <SectionCard variant="default" flushTitle className="scroll-mt-24 p-5 sm:p-6">
      <div className="flex gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-cyan/25 bg-cyan/10 text-cyan">
          <HelpCircle className="size-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-semibold text-foreground">Проверь себя</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ответьте мысленно или вслух — без спешки переходите к тесту.
          </p>
          <ol className="mt-4 space-y-2">
            {items.map((item, i) => {
              const open = openIndex === i;
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : i)}
                    className={cn(
                      "w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                      "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      open ? "border-primary/30 bg-primary/5" : "border-border/80 bg-muted/15",
                    )}
                    aria-expanded={open}
                  >
                    <span className="font-medium text-foreground">
                      {i + 1}. {item.question}
                    </span>
                    {item.hint && open ? (
                      <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">{item.hint}</p>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </SectionCard>
  );
}
