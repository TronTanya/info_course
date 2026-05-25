import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PracticeLabWorkspace({
  id,
  taskTypeLabel,
  componentLabel,
  children,
  className,
}: {
  id?: string;
  taskTypeLabel: string;
  componentLabel: { en: string; ru: string };
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "ce-practice-workspace relative min-w-0 overflow-x-clip rounded-2xl border border-primary/20 bg-card/90 p-4 shadow-card ring-1 ring-primary/10 sm:p-6",
        className,
      )}
    >
      <div className="ce-learn-grid pointer-events-none absolute inset-0 opacity-[0.08]" aria-hidden />
      <div className="relative space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Рабочая область</p>
            <h2 className="mt-1 font-display text-lg font-semibold text-foreground">Терминал и ответ</h2>
          </div>
          <Badge variant="outline" className="w-fit border-success/30 bg-success/5 font-mono text-[10px] text-success">
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
