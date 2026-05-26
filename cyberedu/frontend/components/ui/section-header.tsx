import * as React from "react";
import { cn } from "@/lib/utils";

export type SectionHeaderProps = {
  className?: string;
  title: string;
  /** Связь с `aria-labelledby` у родительской `<section>`. */
  titleId?: string;
  description?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  /** Градиентная акцентная черта слева от заголовка */
  accent?: boolean;
};

export function SectionHeader({
  className,
  title,
  titleId,
  description,
  eyebrow,
  actions,
  accent = false,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0 space-y-1.5">
        {eyebrow ? <p className="ds-typo-eyebrow">{eyebrow}</p> : null}
        <h2 id={titleId} className={cn("ds-typo-h2 text-balance", accent && "ce-section-accent")}>
          {title}
        </h2>
        {description ? <p className="ds-typo-muted max-w-2xl text-pretty">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
