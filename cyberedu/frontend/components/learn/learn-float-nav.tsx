"use client";

import Link from "next/link";
import { BookOpen, Check, ClipboardCheck, FlaskConical, Lock } from "lucide-react";
import type { LearningNavStepItem } from "@/lib/learning-nav";
import { cn } from "@/lib/utils";

const kindIcon = {
  lecture: BookOpen,
  video: BookOpen,
  test: ClipboardCheck,
  practice: FlaskConical,
  result: Check,
} as const;

export function LearnFloatNav({
  steps,
  className,
}: {
  steps: LearningNavStepItem[];
  className?: string;
}) {
  return (
    <nav
      className={cn("ce-learn-float-nav", className)}
      aria-label="Быстрая навигация по шагам модуля"
    >
      {steps.map((step) => {
        const Icon = kindIcon[step.kind] ?? BookOpen;
        const clickable = Boolean(step.actionHref) && step.status !== "blocked";
        const chipClass = cn(
          "ce-learn-float-nav__chip",
          step.isActive && "ce-learn-float-nav__chip--active",
          step.status === "completed" && "ce-learn-float-nav__chip--done",
        );

        const label = (
          <>
            {step.status === "blocked" ? (
              <Lock className="size-3 shrink-0 opacity-60" aria-hidden />
            ) : step.status === "completed" ? (
              <Check className="size-3 shrink-0" aria-hidden />
            ) : (
              <Icon className="size-3 shrink-0 opacity-80" aria-hidden />
            )}
            <span className="truncate max-w-22">{step.title}</span>
          </>
        );

        if (clickable && step.actionHref) {
          return (
            <Link
              key={step.kind}
              href={step.actionHref}
              className={chipClass}
              aria-current={step.isActive ? "step" : undefined}
            >
              {label}
            </Link>
          );
        }

        return (
          <span key={step.kind} className={chipClass} aria-disabled>
            {label}
          </span>
        );
      })}
    </nav>
  );
}
