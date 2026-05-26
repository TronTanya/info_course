import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PracticeLabAnswerArea({
  requirements,
  children,
  className,
}: {
  requirements: string[];
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {requirements.length > 0 ? (
        <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
          <p className="font-mono text-2.5 font-bold uppercase tracking-wider text-primary">Требования к ответу</p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            {requirements.map((line) => (
              <li key={line} className="flex gap-2 text-pretty">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {children}
    </div>
  );
}
