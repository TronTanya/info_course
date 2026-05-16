import * as React from "react";
import { cn } from "@/lib/utils";

export type EmptyStateProps = {
  className?: string;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({ className, icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center shadow-sm transition-colors duration-200 hover:border-primary/25 hover:bg-card",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground ring-1 ring-border">
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description ? <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-6 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}
