"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { LearningStepLink } from "@/lib/learning-nav";
import { Button } from "@/components/ui/button";

export type LessonStickyCtaProps = {
  lessonCompleted: boolean;
  markPending: boolean;
  onMarkStudied: () => void;
  testHref: string;
  nextStep: LearningStepLink | null;
  onAskMentor?: () => void;
  showMentor?: boolean;
};

export function LessonStickyCta({
  lessonCompleted,
  markPending,
  onMarkStudied,
  testHref,
  nextStep,
  onAskMentor,
  showMentor = false,
}: LessonStickyCtaProps) {
  const nextHref = nextStep && !nextStep.disabled ? nextStep.href : testHref;
  const nextLabel =
    lessonCompleted && nextStep && !nextStep.disabled
      ? nextStep.label
      : lessonCompleted
        ? "К тесту"
        : "Изучено";

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-2 sm:flex-row sm:items-center">
      {!lessonCompleted ? (
        <Button
          type="button"
          variant="primary"
          size="lg"
          className="w-full flex-1"
          loading={markPending}
          disabled={markPending}
          onClick={onMarkStudied}
        >
          Отметить как изучено
        </Button>
      ) : (
        <Button asChild variant="primary" size="lg" className="w-full flex-1">
          <Link href={nextHref}>
            {nextLabel}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      )}
      {showMentor && onAskMentor ? (
        <Button type="button" variant="outline" size="lg" className="w-full shrink-0 sm:w-auto" onClick={onAskMentor}>
          <Sparkles className="size-4 text-cyan" aria-hidden />
          AI
        </Button>
      ) : null}
    </div>
  );
}
