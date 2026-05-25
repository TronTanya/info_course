"use client";

import { CheckCircle2, ClipboardList, Sparkles } from "lucide-react";
import { testAfterSubmitSteps } from "@/lib/test-ui";
import { cn } from "@/lib/utils";

const ICONS = [ClipboardList, Sparkles, CheckCircle2] as const;

export function TestPostSubmitTimeline({ className }: { className?: string }) {
  return (
    <section className={cn("ce-test-post-submit", className)} aria-labelledby="test-post-submit-heading">
      <h3 id="test-post-submit-heading" className="text-xs font-semibold uppercase tracking-wide text-foreground">
        Что произошло после отправки
      </h3>
      <ol className="mt-4 space-y-0">
        {testAfterSubmitSteps.map((step, i) => {
          const Icon = ICONS[i] ?? CheckCircle2;
          const last = i === testAfterSubmitSteps.length - 1;
          return (
            <li key={step} className="relative flex gap-3 pb-6 last:pb-0">
              {!last ? (
                <span
                  className="absolute left-[0.6875rem] top-8 bottom-0 w-px bg-border/80"
                  aria-hidden
                />
              ) : null}
              <span
                className="relative z-[1] flex size-6 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary"
                aria-hidden
              >
                <Icon className="size-3.5" />
              </span>
              <p className="pt-0.5 text-sm text-pretty text-muted-foreground">{step}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
