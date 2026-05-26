"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { LearnPanel } from "@/components/learn/learn-chrome";
import { cn } from "@/lib/utils";

export function DashboardAiHint() {
  return (
    <LearnPanel className={cn("ce-surface-depth border-cyan/20 p-4 sm:p-5")}>
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-cyan/25 bg-cyan/10 text-cyan"
            aria-hidden
          >
            <Sparkles className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-sm font-semibold text-foreground">AI-наставник</p>
            <p className="mt-1 text-pretty text-sm text-muted-foreground">
              На лекции и практике — кнопка внизу справа. Объяснит тему и подскажет ход мысли, без готовых ответов на
              тесты.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/course"
          className="shrink-0 rounded-sm text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
        >
          К курсу
        </Link>
      </div>
    </LearnPanel>
  );
}
