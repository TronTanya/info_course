"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function AdminFormStickyBar({
  children,
  backHref,
  backLabel = "Отмена",
  className,
}: {
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 -mx-4 mt-8 border-t border-border/80 bg-background/90 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8",
        className,
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {backHref ? (
          <Link
            href={backHref}
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            ← {backLabel}
          </Link>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap gap-2 sm:justify-end">{children}</div>
      </div>
    </div>
  );
}
