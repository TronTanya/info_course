import * as React from "react";
import { Inbox } from "lucide-react";
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
      role="status"
      className={cn(
        "ce-animate-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/50 px-6 py-14 text-center shadow-sm backdrop-blur-sm",
        "transition-colors duration-300 hover:border-primary/30 hover:bg-card/80",
        className,
      )}
    >
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground ring-1 ring-border shadow-sm">
        {icon ?? <Inbox className="size-7 opacity-70" aria-hidden />}
      </div>
      <h3 className="typo-h3 text-balance">{title}</h3>
      {description ? <p className="typo-body-muted mt-2 max-w-md text-pretty">{description}</p> : null}
      {action ? <div className="mt-8 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  );
}
