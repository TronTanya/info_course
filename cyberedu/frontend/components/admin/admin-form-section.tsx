import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminFormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "ce-glass space-y-4 rounded-2xl border border-border/70 p-5 shadow-sm sm:p-6",
        className,
      )}
    >
      <div className="space-y-1 border-b border-border/50 pb-4">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function AdminFieldLabel({
  htmlFor,
  label,
  hint,
  required,
}: {
  htmlFor?: string;
  label: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div className="mb-1.5 space-y-0.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
        {required ? (
          <span className="ml-1 text-danger" aria-hidden>
            *
          </span>
        ) : null}
        {required ? <span className="sr-only"> (обязательно)</span> : null}
      </label>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
