import type { ReactNode } from "react";
import { cyber } from "@/lib/design-system/cyber";
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
      className={cn(cyber.adminTable, "ce-admin-table-card", className)}
    >
      {title || description || headerActions ? (
        <div className="flex flex-col gap-3 border-b border-border/60 bg-primary/4 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div className="min-w-0">
            {title ? <h2 className="typo-h3">{title}</h2> : null}
            {description ? <p className="typo-caption mt-1">{description}</p> : null}
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
