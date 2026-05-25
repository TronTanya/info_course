"use client";

import { CheckCircle2 } from "lucide-react";
import type { StrongTopic } from "@/types/test-view-model";
import { cn } from "@/lib/utils";

export function TestResultStrongTopics({ topics, className }: { topics: StrongTopic[]; className?: string }) {
  if (topics.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        Пока нет автоматически засчитанных тем — возможно, ответы на проверке.
      </p>
    );
  }

  return (
    <ul className={cn("space-y-2", className)} role="list">
      {topics.map((topic) => (
        <li
          key={topic.title}
          className="flex gap-2 rounded-xl border border-success/25 bg-success/[0.04] px-4 py-3"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
          <span className="text-sm font-medium text-foreground">{topic.title}</span>
        </li>
      ))}
    </ul>
  );
}
