import * as React from "react";
import { Inbox } from "lucide-react";
import { StateShell } from "@/components/ui/state-shell";
import { cn } from "@/lib/utils";

export type EmptyStateProps = {
  className?: string;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  terminalLine?: string;
  /** Компактный вариант для секций внутри страницы (не полноэкранный). */
  compact?: boolean;
};

export function EmptyState({
  className,
  icon,
  title,
  description,
  action,
  terminalLine = "data --empty",
  compact = false,
}: EmptyStateProps) {
  if (compact) {
    return (
      <StateShell variant="empty" terminalLine={terminalLine} role="status" className={cn("ce-empty-state--compact", className)}>
        <div className="flex flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:px-5">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted/80 text-muted-foreground ring-1 ring-border">
            {icon ?? <Inbox className="size-5 opacity-70" aria-hidden />}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
            {description ? <p className="mt-1 text-sm text-pretty text-muted-foreground">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0 sm:self-center">{action}</div> : null}
        </div>
      </StateShell>
    );
  }

  return (
    <StateShell
      variant="empty"
      terminalLine={terminalLine}
      role="status"
      className={cn(
        "ce-empty-state transition-[border-color,box-shadow] duration-200 hover:border-primary/35 hover:shadow-[0_0_32px_-12px_color-mix(in_oklab,var(--primary)_25%,transparent)]",
        className,
      )}
    >
      <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
        <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground ring-1 ring-border shadow-sm">
          {icon ?? <Inbox className="size-7 opacity-70" aria-hidden />}
        </div>
        <h3 className="typo-h3 text-balance">{title}</h3>
        {description ? <p className="typo-body-muted mt-2 max-w-md text-pretty">{description}</p> : null}
        {action ? <div className="mt-8 flex flex-wrap justify-center gap-3">{action}</div> : null}
      </div>
    </StateShell>
  );
}
