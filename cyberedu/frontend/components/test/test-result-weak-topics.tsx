"use client";

import Link from "next/link";
import { AlertTriangle, BookOpen } from "lucide-react";
import type { WeakTopic } from "@/types/test-view-model";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TestResultWeakTopics({ topics, className }: { topics: WeakTopic[]; className?: string }) {
  if (topics.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        Нет тем для повторения по автоматической проверке — отличный результат или ответы ещё на проверке.
      </p>
    );
  }

  return (
    <ul className={cn("space-y-3", className)} role="list">
      {topics.map((topic) => (
        <li key={topic.title} className="rounded-xl border border-danger/25 bg-danger/[0.04] px-4 py-3">
          <div className="flex gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{topic.title}</p>
              {topic.reason ? (
                <p className="mt-1 text-sm text-pretty text-muted-foreground">{topic.reason}</p>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  Ответ не засчитан — повторите материал лекции по этой теме.
                </p>
              )}
              {topic.relatedLessonHref ? (
                <Button asChild variant="outline" size="sm" className="mt-3 gap-1.5">
                  <Link href={topic.relatedLessonHref}>
                    <BookOpen className="size-3.5" aria-hidden />
                    Перейти к уроку
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
