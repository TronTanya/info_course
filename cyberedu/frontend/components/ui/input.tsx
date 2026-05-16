import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, hint, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label ? (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        ) : null}
        <input
          id={inputId}
          type={type}
          className={cn(
            "flex h-11 min-h-11 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-base text-card-foreground shadow-sm transition-all duration-200 sm:text-sm",
            "placeholder:text-muted-foreground/80",
            "hover:border-primary/35",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-danger focus-visible:ring-danger",
            className,
          )}
          ref={ref}
          {...props}
        />
        {error ? <p className="text-xs text-danger">{error}</p> : null}
        {!error && hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    );
  },
);
Input.displayName = "Input";
