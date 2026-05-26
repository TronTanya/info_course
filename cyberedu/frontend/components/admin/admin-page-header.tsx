import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  eyebrow = "Администрирование",
  title,
  description,
  breadcrumb,
  actions,
  meta,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "ce-admin-page-hero relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card sm:p-7",
        className,
      )}
    >
      <div className="relative z-10 space-y-4">
        {breadcrumb ? <div className="text-sm text-muted-foreground">{breadcrumb}</div> : null}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="typo-eyebrow text-primary">{eyebrow}</p>
            <h1 className="typo-h1 text-balance sm:text-3xl">{title}</h1>
            {description ? (
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
            ) : null}
            {meta ? <div className="flex flex-wrap gap-2 pt-1">{meta}</div> : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
        </div>
      </div>
    </header>
  );
}
