import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Боковая панель модуля на узких экранах — аккордеон вместо третьей колонки. */
export function LearningAsideMobile({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <details
      className={cn(
        "ce-mobile-accordion group rounded-2xl border border-border/80 bg-card/80 open:shadow-card xl:hidden",
        className,
      )}
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-base font-semibold text-foreground [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="min-w-0 border-t border-border/60 p-4">{children}</div>
    </details>
  );
}
