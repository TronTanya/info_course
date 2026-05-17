import * as React from "react";
import { cn } from "@/lib/utils";
import type { AdminTableDensity } from "@/components/admin/admin-table-toolbar";

export function AdminTable({
  children,
  className,
  minWidth = "960px",
  density = "comfortable",
}: {
  children: React.ReactNode;
  className?: string;
  minWidth?: string;
  density?: AdminTableDensity;
}) {
  return (
    <table
      className={cn(
        "ce-admin-table w-full border-collapse text-sm",
        density === "compact" && "ce-admin-table--compact",
        className,
      )}
      style={{ minWidth }}
    >
      {children}
    </table>
  );
}

export function AdminTableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return <thead className={cn("ce-admin-table-head", className)}>{children}</thead>;
}

export function AdminTableBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tbody className={cn("ce-admin-table-body", className)}>{children}</tbody>;
}
