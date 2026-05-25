"use client";

import { createElement } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  FlaskConical,
  LayoutGrid,
  Lock,
  type LucideIcon,
} from "lucide-react";
import {
  buildTestNextLearningStep,
  type TestPageLearningContext,
} from "@/lib/test-next-learning-step";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";

function ctaIcon(href: string): LucideIcon {
  if (href.includes("/practice")) return FlaskConical;
  if (href.includes("/lesson")) return BookOpen;
  if (href.includes("/certificate")) return Award;
  if (href.includes("/dashboard/course/") && !href.includes("/lesson") && !href.includes("/test") && !href.includes("/practice")) {
    return LayoutGrid;
  }
  return ArrowRight;
}

export function TestNextStepPanel({
  learning,
  passed,
  className,
}: {
  learning: TestPageLearningContext;
  passed: boolean;
  className?: string;
}) {
  const step = buildTestNextLearningStep(learning, passed);
  const PrimaryIcon = ctaIcon(step.primaryCta.href);
  const showLessonList = step.variant === "failed_review" && step.relatedLessons.length > 0;
  const practiceLockedHint =
    !passed && learning.hasPractice
      ? "Практика откроется после успешной сдачи теста."
      : null;

  return (
    <SectionCard variant="lab" flushTitle className={cn("p-4 sm:p-6", className)} title="Следующий шаг">
      <div className="space-y-4">
        <div
          className={cn(
            "rounded-xl border p-4 sm:p-5",
            step.variant === "failed_review"
              ? "border-warning/35 bg-warning/[0.06]"
              : "border-primary/30 bg-primary/5",
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Рекомендуем</p>
          <h3 className="mt-1 font-display text-base font-semibold text-balance text-foreground sm:text-lg">
            {step.headline}
          </h3>
          <p className="mt-2 text-sm text-pretty text-muted-foreground">{step.description}</p>

          {showLessonList ? (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Связанные уроки
              </p>
              <ul className="mt-2 space-y-2" role="list">
                {step.relatedLessons.map((lesson) => (
                  <li key={lesson.href}>
                    <Link
                      href={lesson.href}
                      className="flex items-start gap-2 rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <BookOpen className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                      <span className="text-pretty">{lesson.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {step.primaryCta.disabled ? (
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground" role="status">
              <Lock className="size-4 shrink-0" aria-hidden />
              {step.primaryCta.hint ?? "Шаг пока недоступен."}
            </p>
          ) : (
            <Button asChild variant="primary" size="lg" className="mt-4 w-full gap-2 sm:w-auto">
              <Link href={step.primaryCta.href}>
                {createElement(PrimaryIcon, { className: "size-4", "aria-hidden": true })}
                {step.primaryCta.label}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          )}
          {step.primaryCta.hint && !step.primaryCta.disabled ? (
            <p className="mt-2 text-xs text-muted-foreground">{step.primaryCta.hint}</p>
          ) : null}
        </div>

        {practiceLockedHint ? (
          <p className="text-xs text-muted-foreground" role="note">
            {practiceLockedHint}
          </p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          {step.certificateCta ? (
            <div className="rounded-xl border border-border/70 bg-muted/15 p-4 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Сертификат</p>
              {step.certificateCta.hint ? (
                <p className="mt-1 text-sm text-muted-foreground">{step.certificateCta.hint}</p>
              ) : null}
              <Button asChild variant="outline" size="md" className="mt-3 w-full gap-2 sm:w-auto">
                <Link href={step.certificateCta.href}>
                  <Award className="size-4" aria-hidden />
                  {step.certificateCta.label}
                </Link>
              </Button>
            </div>
          ) : null}

          {step.secondaryCta ? (
            <div className="rounded-xl border border-border/70 bg-muted/15 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Также</p>
              {step.secondaryCta.hint ? (
                <p className="mt-1 text-sm text-muted-foreground">{step.secondaryCta.hint}</p>
              ) : null}
              <Button asChild variant="outline" size="md" className="mt-3 w-full gap-2">
                <Link href={step.secondaryCta.href}>
                  {createElement(ctaIcon(step.secondaryCta.href), { className: "size-4", "aria-hidden": true })}
                  {step.secondaryCta.label}
                </Link>
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </SectionCard>
  );
}
