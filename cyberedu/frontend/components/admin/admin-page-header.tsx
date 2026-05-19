import type { ReactNode } from "react";
import { cyber } from "@/lib/design-system/cyber";
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
        "ce-admin-page-hero",
        cyber.hero,
        "rounded-2xl border-primary/15 p-5 sm:p-7",
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/10 blur-3xl" aria-hidden />
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
