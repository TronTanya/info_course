import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "border-border bg-muted/60 text-foreground",
  success: "border-success/35 bg-success/10 text-success",
  warning: "border-warning/40 bg-warning/10 text-warning",
  danger: "border-danger/35 bg-danger/10 text-danger",
  info: "border-cyan/35 bg-cyan/10 text-cyan",
  accent: "border-accent/35 bg-accent/10 text-accent",
} as const;

const icons: Record<keyof typeof variants, React.ReactNode> = {
  default: (
    <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  ),
  success: (
    <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  warning: (
    <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  ),
  danger: (
    <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6M9 9l6 6" />
    </svg>
  ),
  info: (
    <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  ),
  accent: (
    <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L6 21l2.3-7-6-4.6h7.6L12 2z" />
    </svg>
  ),
};

export type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: keyof typeof variants;
  title?: string;
  /** Скрыть иконку слева */
  hideIcon?: boolean;
};

export function Alert({ className, variant = "default", title, hideIcon, children, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-2xl border px-4 py-3.5 text-sm shadow-sm transition-[border-color,background] duration-200",
        variants[variant],
        className,
      )}
      {...props}
    >
      {!hideIcon ? <span className="mt-0.5 opacity-90">{icons[variant]}</span> : null}
      <div className="min-w-0 flex-1 space-y-1">
        {title ? <p className="font-semibold leading-tight text-foreground">{title}</p> : null}
        <div className={cn("leading-relaxed", title ? "text-muted-foreground" : "text-foreground/90")}>{children}</div>
      </div>
    </div>
  );
}
