import * as React from "react";
import { cn } from "@/lib/utils";

export type GradientBorderProps = React.HTMLAttributes<HTMLDivElement> & {
  padding?: "none" | "sm" | "md";
};

const paddingClass = {
  none: "p-0",
  sm: "p-px",
  md: "p-[2px]",
} as const;

export function GradientBorder({ className, padding = "sm", children, ...props }: GradientBorderProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-[image:var(--gradient-border-glow)] shadow-[0_0_24px_-8px_color-mix(in_oklab,var(--primary)_35%,transparent)]",
        paddingClass[padding],
        className,
      )}
      {...props}
    >
      <div className="h-full w-full rounded-[calc(var(--radius-2xl)-2px)] bg-card card-gradient">{children}</div>
    </div>
  );
}
