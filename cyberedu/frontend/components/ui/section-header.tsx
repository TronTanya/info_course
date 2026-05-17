import * as React from "react";
import { cn } from "@/lib/utils";

export type SectionHeaderProps = {
  className?: string;
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
};

export function SectionHeader({ className, title, description, eyebrow, actions }: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0 space-y-1.5">
        {eyebrow ? <p className="typo-eyebrow text-primary">{eyebrow}</p> : null}
        <h2 className="typo-h2 text-balance">{title}</h2>
        {description ? <p className="typo-body-muted max-w-2xl text-pretty">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
