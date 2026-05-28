"use client";

import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Ниже `md` — мобильная вёрстка; с `md` — desktop-блок со скроллом только внутри обёртки. */
export const AdminDualTable = forwardRef<
  HTMLDivElement,
  {
    mobile: ReactNode;
    desktop: ReactNode;
    className?: string;
  }
>(function AdminDualTable({ mobile, desktop, className }, ref) {
  return (
    <div className={cn("ce-admin-dual-table w-full min-w-0", className)}>
      <div className="md:hidden">{mobile}</div>
      <div
        ref={ref}
        className="admin-table-scroll ce-admin-table-scroll ce-admin-data-table-wrap hidden min-h-0 md:block"
        data-testid="admin-data-table-wrap"
      >
        {desktop}
      </div>
    </div>
  );
});
