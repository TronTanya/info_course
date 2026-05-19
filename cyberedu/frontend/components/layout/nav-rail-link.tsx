"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavRailLink({
  href,
  label,
  icon: Icon,
  description,
  active,
  compact,
  onClick,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  active: boolean;
  compact?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-xl text-sm font-medium transition-colors",
        compact ? "px-2.5 py-2" : "px-3 py-2.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
        active
          ? "bg-primary/15 text-primary shadow-sm ring-1 ring-primary/30"
          : "text-muted-foreground hover:bg-primary/8 hover:text-foreground",
      )}
      aria-current={active ? "page" : undefined}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg transition-colors",
          compact ? "size-7" : "size-8",
          active ? "bg-primary/15 text-primary" : "bg-muted/60 text-muted-foreground group-hover:text-foreground",
        )}
        aria-hidden
      >
        <Icon className={compact ? "size-3.5" : "size-4"} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate">{label}</span>
        {description && !compact ? (
          <span className="mt-0.5 block truncate text-[11px] font-normal text-muted-foreground">{description}</span>
        ) : null}
      </span>
      {active && !compact ? <ChevronRight className="size-4 shrink-0 opacity-60" aria-hidden /> : null}
    </Link>
  );
}
