"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold tracking-tight transition-[color,background,box-shadow,transform,border-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-busy:opacity-80 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] motion-reduce:active:scale-100 motion-reduce:transition-none";

const variants = {
  primary:
    "bg-primary text-primary-foreground shadow-card ring-1 ring-primary/20 hover:shadow-[var(--shadow-card-hover)] hover:bg-[color-mix(in_oklab,var(--primary)_88%,#000)] hover:ring-primary/35",
  secondary:
    "bg-secondary text-secondary-foreground shadow-sm ring-1 ring-secondary/25 hover:bg-[color-mix(in_oklab,var(--secondary)_90%,#fff)] hover:shadow-md hover:ring-secondary/35",
  accent:
    "bg-accent text-accent-foreground shadow-sm ring-1 ring-accent/25 hover:bg-[color-mix(in_oklab,var(--accent)_88%,#000)] hover:shadow-md hover:ring-accent/40",
  outline:
    "border border-border/90 bg-card/90 text-card-foreground shadow-sm hover:border-primary/40 hover:bg-muted/60 hover:text-primary hover:ring-1 hover:ring-primary/15",
  ghost: "text-foreground hover:bg-muted/80",
  danger:
    "bg-danger text-danger-foreground shadow-sm ring-1 ring-danger/20 hover:bg-[color-mix(in_oklab,var(--danger)_88%,#000)] hover:shadow-md",
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
        aria-busy={loading || undefined}
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
