"use client";

import Link from "next/link";
import { ArrowLeft, Bot, Sparkles } from "lucide-react";
import { MENTOR_PAGE_DESCRIPTION, MENTOR_PAGE_TITLE } from "@/lib/mentor-standalone-page";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MentorPageHero({
  stats,
  weakTopicsCount,
  className,
}: {
  stats: ProfileCourseStats | null;
  weakTopicsCount: number;
  className?: string;
}) {
  const progress = stats?.progressPercent ?? 0;
  const moduleTitle = stats?.currentModuleTitle?.trim();

  return (
    <header
      className={cn(
        "ce-mentor-page-hero relative overflow-hidden rounded-2xl border border-cyan/20 px-4 py-4 sm:px-5 sm:py-5",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_100%_-10%,color-mix(in_oklab,var(--cyan)_18%,transparent),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_0%_100%,color-mix(in_oklab,var(--primary)_10%,transparent),transparent_50%)]"
        aria-hidden
      />

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-cyan/35 bg-cyan/12 text-cyan shadow-[0_0_28px_-8px_color-mix(in_oklab,var(--cyan)_45%,transparent)]"
            aria-hidden
          >
            <Bot className="size-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="-ml-2 mb-1 h-8 gap-1 px-2 text-xs text-muted-foreground"
            >
              <Link href="/dashboard">
                <ArrowLeft className="size-3.5" aria-hidden />
                Кабинет
              </Link>
            </Button>
            <h1 className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {MENTOR_PAGE_TITLE}
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-pretty text-muted-foreground">
              {MENTOR_PAGE_DESCRIPTION}
            </p>
          </div>
        </div>

        <ul
          className="flex shrink-0 flex-wrap gap-1.5 sm:max-w-[14rem] sm:flex-col sm:items-end"
          aria-label="Статус обучения"
        >
          {stats ? (
            <li className="rounded-lg border border-border/70 bg-background/60 px-2.5 py-1 text-xs tabular-nums backdrop-blur-sm">
              <span className="text-muted-foreground">Прогресс </span>
              <span className="font-semibold text-foreground">{progress}%</span>
            </li>
          ) : null}
          {moduleTitle ? (
            <li
              className="max-w-full truncate rounded-lg border border-cyan/25 bg-cyan/[0.08] px-2.5 py-1 text-xs text-foreground"
              title={moduleTitle}
            >
              {moduleTitle}
            </li>
          ) : null}
          {weakTopicsCount > 0 ? (
            <li className="inline-flex items-center gap-1 rounded-lg border border-warning/30 bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
              <Sparkles className="size-3 shrink-0" aria-hidden />
              {weakTopicsCount} {weakTopicsCount === 1 ? "слабая тема" : "слабых тем"}
            </li>
          ) : null}
        </ul>
      </div>
    </header>
  );
}
