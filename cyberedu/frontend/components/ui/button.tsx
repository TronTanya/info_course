"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { focusRing, interactiveScale, transitionBase } from "@/lib/design-system/primitives";
import { cn } from "@/lib/utils";

const base = cn(
  "inline-flex w-full min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold tracking-tight sm:w-auto",
  transitionBase,
  focusRing,
  interactiveScale,
  "disabled:pointer-events-none disabled:opacity-50 aria-busy:opacity-80",
  "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
);

const variants = {
  primary: cn(
    "bg-primary text-primary-foreground shadow-card ring-1 ring-primary/30",
    "hover:shadow-[var(--shadow-card-hover),var(--shadow-glow)] hover:brightness-110",
  ),
  secondary: cn(
    "bg-secondary text-secondary-foreground shadow-sm ring-1 ring-border",
    "hover:bg-[color-mix(in_oklab,var(--secondary)_92%,var(--primary)_8%)] hover:ring-primary/20",
  ),
  accent: cn(
    "bg-accent text-accent-foreground shadow-sm ring-1 ring-border",
    "hover:ring-primary/25",
  ),
  outline: cn(
    "border border-border bg-card text-foreground shadow-sm",
    "hover:border-primary/35 hover:bg-muted/80 hover:text-primary hover:shadow-[var(--shadow-glow)]",
  ),
  ghost: "text-foreground hover:bg-muted/70",
  danger: cn(
    "bg-danger text-danger-foreground shadow-sm ring-1 ring-danger/30",
    "hover:brightness-110",
  ),
} as const;

const sizes = {
  sm: "h-11 min-h-11 px-3.5 text-sm",
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
  (
    { className, variant = "primary", size = "md", asChild = false, loading, type = "button", disabled, children, ...props },
    ref,
  ) => {
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
