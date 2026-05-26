import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PracticeLabWorkspace({
  taskTypeLabel,
  componentLabel,
  children,
  className,
}: {
  taskTypeLabel: string;
  componentLabel: { en: string; ru: string };
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "ce-mission-panel ce-mission-panel--sandbox ce-practice-workspace relative overflow-hidden p-5 sm:p-6",
        className,
      )}
    >
      <div className="ce-learn-grid pointer-events-none absolute inset-0 opacity-8" aria-hidden />
      <div className="relative space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="ce-learn-os-eyebrow">Sandbox</p>
            <h2 className="mt-1 font-heading text-lg font-semibold text-foreground">Терминал и ответ</h2>
          </div>
          <Badge variant="outline" className="w-fit border-success/30 bg-success/5 font-mono text-2.5 text-success">
            {taskTypeLabel}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="font-mono text-foreground">{componentLabel.en}</span> · {componentLabel.ru}
        </p>
        {children}
      </div>
    </section>
  );
}
