import * as React from "react";
import { cn } from "@/lib/utils";

/** Ниже `md` — мобильная вёрстка; с `md` — таблица со скроллом только внутри блока. */
export function AdminDualTable({
  mobile,
  desktop,
  className,
}: {
  mobile: React.ReactNode;
  desktop: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full min-w-0", className)}>
      <div className="md:hidden">{mobile}</div>
      <div className="admin-table-scroll hidden md:block">
        {desktop}
      </div>
    </div>
  );
}
