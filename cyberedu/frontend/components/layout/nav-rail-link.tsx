"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { navVariants } from "@/lib/design-system/components";
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
        navVariants.link,
        "relative z-10",
        active && "ds-nav-link--active",
        compact && "py-2",
      )}
      aria-current={active ? "page" : undefined}
    >
      <span className={navVariants.linkIcon} aria-hidden>
        <Icon className={compact ? "size-3.5" : "size-4"} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate">{label}</span>
        {description && !compact ? (
          <span className="mt-0.5 block truncate text-2.75 font-normal text-muted-foreground">{description}</span>
        ) : null}
      </span>
      {active && !compact ? <ChevronRight className="size-4 shrink-0 opacity-60" aria-hidden /> : null}
    </Link>
  );
}
