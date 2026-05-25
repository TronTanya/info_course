import * as React from "react";
import { cn } from "@/lib/utils";
import type { AdminTableDensity } from "@/components/admin/admin-table-toolbar";

export function AdminTable({
  children,
  className,
  minWidth = "960px",
  density = "comfortable",
  caption,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  minWidth?: string;
  density?: AdminTableDensity;
  /** Видимое или скрытое имя таблицы (предпочтительнее `aria-label`). */
  caption?: string;
  "aria-label"?: string;
}) {
  return (
    <table
      className={cn(
        "ce-admin-table w-full border-collapse text-sm",
        density === "compact" && "ce-admin-table--compact",
        className,
      )}
      style={{ minWidth }}
      aria-label={caption ? undefined : ariaLabel}
    >
      {caption ? <caption className="sr-only">{caption}</caption> : null}
      {children}
    </table>
  );
}

export function AdminTableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return <thead className={cn("ce-admin-table-head", className)}>{children}</thead>;
}

export function AdminTh({
  children,
  className,
  scope = "col",
}: {
  children: React.ReactNode;
  className?: string;
  scope?: "col" | "row";
}) {
  return (
    <th
      scope={scope}
      className={cn(
        "px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function AdminTableBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tbody className={cn("ce-admin-table-body", className)}>{children}</tbody>;
}
