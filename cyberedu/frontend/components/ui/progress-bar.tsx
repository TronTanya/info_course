import { cn } from "@/lib/utils";

export type ProgressBarProps = {
  value: number;
  max?: number;
  className?: string;
  label?: string;
  /** Визуальный акцент полосы */
  tone?: "default" | "success" | "warning" | "danger";
};

const toneBar: Record<NonNullable<ProgressBarProps["tone"]>, string> = {
  default: "bg-gradient-to-r from-primary via-cyan to-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export function ProgressBar({ value, max = 100, className, label, tone = "default" }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("w-full space-y-1", className)}>
      {label ? (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <span className="tabular-nums text-foreground">{Math.round(pct)}%</span>
        </div>
      ) : null}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted ring-1 ring-inset ring-border/80"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-500 ease-out", toneBar[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
