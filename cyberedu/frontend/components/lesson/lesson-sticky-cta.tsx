"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export type LessonStickyCtaProps = {
  lessonCompleted: boolean;
  markPending: boolean;
  onMarkStudied: () => void;
  testHref: string;
};

export function LessonStickyCta({
  lessonCompleted,
  markPending,
  onMarkStudied,
  testHref,
}: LessonStickyCtaProps) {
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
          <Link href={testHref}>
            Перейти к тесту
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      )}
    </div>
  );
}
