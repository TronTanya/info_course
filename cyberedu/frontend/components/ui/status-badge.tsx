import type * as React from "react";
import type { UiStatus } from "@/types/ui-status";
import { cn } from "@/lib/utils";

const config: Record<UiStatus, { label: string; className: string }> = {
  loading: {
    label: "Загрузка",
    className: "border-border bg-muted text-muted-foreground",
  },
  success: {
    label: "Успех",
    className: "border-success/35 bg-success/12 text-success",
  },
  error: {
    label: "Ошибка",
    className: "border-danger/35 bg-danger/12 text-danger",
  },
  empty: {
    label: "Пусто",
    className: "border-border bg-card text-muted-foreground",
  },
  locked: {
    label: "Закрыто",
    className: "border-secondary/30 bg-secondary/10 text-secondary",
  },
  completed: {
    label: "Готово",
    className: "border-primary/35 bg-primary/10 text-primary",
  },
  in_progress: {
    label: "В процессе",
    className: "border-primary/35 bg-primary/10 text-primary",
  },
  pending: {
    label: "Ожидание",
    className: "border-cyan/30 bg-cyan/8 text-cyan",
  },
  warning: {
    label: "Внимание",
    className: "border-warning/45 bg-warning/15 text-foreground",
  },
  disabled: {
    label: "Недоступно",
    className: "border-border/60 bg-muted/30 text-muted-foreground",
  },
};

export type StatusBadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  status: UiStatus;
  /** Переопределить подпись */
  label?: string;
};

export function StatusBadge({ status, label, className, ...rest }: StatusBadgeProps) {
  const c = config[status];
  const text = label ?? c.label;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium",
        c.className,
        className,
      )}
      {...rest}
    >
      {status === "loading" ? (
        <span
          className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-80"
          aria-hidden
        />
      ) : null}
      {status === "locked" ? (
        <svg className="size-3.5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ) : null}
      {status === "completed" ? (
        <svg className="size-3.5 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : null}
      {status === "in_progress" ? (
        <span className="relative flex size-3.5" aria-hidden>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-cyan/40 opacity-75" />
          <span className="relative inline-flex size-3.5 rounded-full bg-cyan/70" />
        </span>
      ) : null}
      {status === "pending" ? (
        <svg className="size-3.5 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" strokeLinecap="round" />
        </svg>
      ) : null}
      {status === "warning" ? (
        <svg className="size-3.5 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
          <path d="M10.3 3.6 1.8 18a1 1 0 0 0 .9 1.4h18.6a1 1 0 0 0 .9-1.4L13.7 3.6a1 1 0 0 0-1.8 0Z" />
        </svg>
      ) : null}
      <span>{text}</span>
    </span>
  );
}
