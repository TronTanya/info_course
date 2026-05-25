"use client";

import Link from "next/link";
import { ArrowRight, FlaskConical } from "lucide-react";
import type { PracticeNextStep } from "@/types/practice-view-model";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PracticeApprovedNextStep({
  nextStep,
  moduleHref,
  className,
}: {
  nextStep?: PracticeNextStep;
  moduleHref: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-success/35 bg-success/[0.06] px-4 py-4 ring-1 ring-inset ring-success/20",
        className,
      )}
      role="status"
    >
      <p className="font-display text-sm font-semibold text-foreground">Практика зачтена</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Форма ответа закрыта. Основной шаг — продолжить программу.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {nextStep ? (
          <Button asChild variant="primary" size="lg" className="gap-2">
            <Link href={nextStep.href}>
              {nextStep.title}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        ) : null}
        <Button asChild variant={nextStep ? "outline" : "primary"} size="lg" className="gap-2">
          <Link href={moduleHref}>
            <FlaskConical className="size-4" aria-hidden />
            К модулю
          </Link>
        </Button>
      </div>
    </div>
  );
}
