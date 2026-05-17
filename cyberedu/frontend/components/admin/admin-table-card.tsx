import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminTableCard({
  title,
  description,
  toolbar,
  headerActions,
  children,
  footer,
  className,
}: {
  title?: string;
  description?: string;
  toolbar?: ReactNode;
  headerActions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/70 bg-card shadow-md ring-1 ring-secondary/[0.04]",
        className,
      )}
    >
      {title || description || headerActions ? (
        <div className="flex flex-col gap-3 border-b border-border/60 bg-muted/25 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div className="min-w-0">
            {title ? <h2 className="text-lg font-semibold text-foreground">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {headerActions ? <div className="flex shrink-0 flex-wrap gap-2">{headerActions}</div> : null}
        </div>
      ) : null}
      {toolbar}
      <div className="min-w-0">{children}</div>
      {footer ? <div className="border-t border-border/60 bg-muted/15 px-4 py-3 sm:px-6">{footer}</div> : null}
    </div>
  );
}
