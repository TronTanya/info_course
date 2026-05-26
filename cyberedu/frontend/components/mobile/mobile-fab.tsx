"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MobileFab({
  children,
  className,
  onClick,
  label,
  aboveTabBar = true,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  label: string;
  aboveTabBar?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "ce-mobile-fab ce-touch-target lg:hidden",
        aboveTabBar && "ce-mobile-fab--above-tab",
        className,
      )}
      onClick={onClick}
      aria-label={label}
    >
      {children}
    </button>
  );
}
