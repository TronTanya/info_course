"use client";

import * as React from "react";
import { tooltipVariants } from "@/lib/design-system/components";
import { cn } from "@/lib/utils";

export type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom";
  className?: string;
};

export function Tooltip({ content, children, side = "top", className }: TooltipProps) {
  const id = React.useId();

  return (
    <span className="group/tooltip relative inline-flex">
      <span tabIndex={0} className="inline-flex outline-hidden" aria-describedby={id}>
        {children}
      </span>
      <span
        id={id}
        role="tooltip"
        className={cn(
          tooltipVariants.content,
          "pointer-events-none absolute left-1/2 z-max w-max max-w-64 -translate-x-1/2 opacity-0 transition-opacity duration-200 ease-out",
          "group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100",
          side === "top" ? "bottom-full mb-2" : "top-full mt-2",
          className,
        )}
      >
        {content}
      </span>
    </span>
  );
}
