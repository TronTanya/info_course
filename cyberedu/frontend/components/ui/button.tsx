"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { buttonClass, buttonVariants, type ButtonVariant } from "@/lib/design-system/components";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant | "accent";
  size?: "sm" | "md" | "lg" | "icon";
  asChild?: boolean;
  loading?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      asChild = false,
      loading,
      type = "button",
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild && !loading ? Slot : "button";
    const isDisabled = disabled || loading;

    if (variant === "accent") {
      return (
        <Comp
          className={cn(
            buttonVariants.base,
            buttonVariants.accent,
            size === "sm" && buttonVariants.sm,
            size === "lg" && buttonVariants.lg,
            size === "icon" && buttonVariants.icon,
            "w-full sm:w-auto",
            className,
          )}
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
    }

    const sizeKey = size === "md" ? undefined : size;

    return (
      <Comp
        className={cn(buttonClass(variant, sizeKey), "w-full sm:w-auto", className)}
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
