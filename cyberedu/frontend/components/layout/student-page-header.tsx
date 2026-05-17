import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StudentPageHeader({
  breadcrumbItems,
  eyebrow,
  title,
  description,
  backHref,
  backLabel = "← Назад",
  actions,
  className,
}: {
  breadcrumbItems?: BreadcrumbItem[];
  eyebrow?: string;
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "ce-learn-header ce-border-beam space-y-4 rounded-2xl border border-border/70 bg-card/90 p-5 shadow-card",
        className,
      )}
    >
      {breadcrumbItems?.length ? <Breadcrumbs items={breadcrumbItems} /> : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          {eyebrow ? (
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-cyan/90">{eyebrow}</p>
          ) : null}
          <h1 className="typo-h2 text-balance">{title}</h1>
          {description ? <p className="text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {backHref ? (
            <Button asChild variant="outline" size="sm">
              <Link href={backHref}>{backLabel}</Link>
            </Button>
          ) : null}
          {actions}
        </div>
      </div>
    </header>
  );
}
