"use client";

import Link from "next/link";
import { createElement } from "react";
import { ArrowRight, BookOpen, FlaskConical, LayoutGrid, RotateCcw } from "lucide-react";
import type { Recommendation } from "@/types/test-view-model";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function recommendationIcon(title: string) {
  if (title.includes("практик")) return FlaskConical;
  if (title.includes("материал") || title.includes("урок")) return BookOpen;
  if (title.includes("тест")) return RotateCcw;
  return LayoutGrid;
}

export function TestResultRecommendations({
  items,
  onRetryTest,
  className,
}: {
  items: Recommendation[];
  onRetryTest?: () => void;
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <ul className={cn("grid gap-3 sm:grid-cols-2", className)} role="list">
      {items.map((item) => {
        const Icon = recommendationIcon(item.title);
        const isRetry = item.title === "Повторить тест";
        const actionable = Boolean(item.href) || (isRetry && onRetryTest);

        return (
          <li
            key={item.title}
            className="flex flex-col rounded-xl border border-border/70 bg-muted/15 p-4"
          >
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
            {item.description ? (
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{item.description}</p>
            ) : null}
            {actionable ? (
              isRetry && onRetryTest ? (
                <Button type="button" variant="outline" size="md" className="mt-3 w-full gap-2" onClick={onRetryTest}>
                  {createElement(Icon, { className: "size-4", "aria-hidden": true })}
                  {item.title}
                </Button>
              ) : item.href ? (
                <Button asChild variant="outline" size="md" className="mt-3 w-full gap-2">
                  <Link href={item.href}>
                    {createElement(Icon, { className: "size-4", "aria-hidden": true })}
                    {item.title}
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              ) : null
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">Информация · действие не требуется</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
