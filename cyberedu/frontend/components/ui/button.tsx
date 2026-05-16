"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]";

const variants = {
  primary:
    "bg-primary text-primary-foreground shadow-card ring-1 ring-primary/15 hover:shadow-[var(--shadow-card-hover)] hover:bg-[color-mix(in_oklab,var(--primary)_90%,#000)] hover:ring-primary/25",
  secondary:
    "bg-secondary text-secondary-foreground shadow-sm ring-1 ring-secondary/20 hover:bg-[color-mix(in_oklab,var(--secondary)_88%,#fff)] hover:shadow-md hover:ring-secondary/30",
  outline:
    "border border-border/90 bg-card/95 text-card-foreground shadow-sm ring-1 ring-transparent hover:border-primary/35 hover:bg-muted/70 hover:text-primary hover:ring-primary/10",
  ghost: "text-foreground hover:bg-muted/90",
  danger:
    "bg-danger text-danger-foreground shadow-sm hover:bg-[color-mix(in_oklab,var(--danger)_88%,#000)] hover:shadow-md",
} as const;

const sizes = {
  sm: "h-10 min-h-10 px-3.5 text-sm",
  md: "h-11 min-h-11 px-4",
  lg: "h-12 min-h-12 px-5 text-base",
  icon: "h-11 min-h-11 w-11 min-w-11 p-0",
} as const;

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  asChild?: boolean;
  loading?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild = false, loading, type = "button", disabled, children, ...props }, ref) => {
    const Comp = asChild && !loading ? Slot : "button";
    const isDisabled = disabled || loading;

    return (
      <Comp
        className={cn(base, variants[variant], sizes[size], className)}
        ref={ref}
        type={asChild && !loading ? undefined : type}
        disabled={asChild ? undefined : isDisabled}
        {...props}
      >
        {loading && !asChild ? (
          <span className="inline-flex items-center gap-2">
            <span
              className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-80"
              aria-hidden
            />
            {children}
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";
