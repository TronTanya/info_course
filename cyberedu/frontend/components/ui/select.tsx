import * as React from "react";
import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, hint, error, id, children, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id ?? generatedId;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label ? (
          <label htmlFor={selectId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        ) : null}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "flex h-11 min-h-11 w-full appearance-none rounded-xl border border-border bg-card py-2 pl-3 pr-10 text-base text-card-foreground shadow-sm transition-all duration-200 sm:text-sm",
              "hover:border-primary/35",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-danger focus-visible:ring-danger",
              className,
            )}
            {...props}
          >
            {children}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </div>
        {error ? <p className="text-xs text-danger">{error}</p> : null}
        {!error && hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    );
  },
);
Select.displayName = "Select";
