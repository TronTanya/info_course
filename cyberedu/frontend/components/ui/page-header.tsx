import * as React from "react";
import { cn } from "@/lib/utils";

export type PageHeaderProps = {
  className?: string;
  title: string;
  /** Короткая подпись над заголовком (курс, раздел) */
  eyebrow?: string;
  description?: string;
  /** Навигация / хлебные крошки */
  breadcrumb?: React.ReactNode;
  actions?: React.ReactNode;
};

export function PageHeader({ className, title, eyebrow, description, breadcrumb, actions }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="min-w-0 space-y-2">
        {breadcrumb ? <div className="typo-caption">{breadcrumb}</div> : null}
        <div>
          {eyebrow ? <p className="typo-eyebrow text-primary">{eyebrow}</p> : null}
          <h1 className={cn("text-balance typo-h1", eyebrow && "mt-1")}>{title}</h1>
          {description ? <p className="typo-body-muted mt-2 max-w-2xl">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex w-full min-w-0 shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">{actions}</div> : null}
    </div>
  );
}
