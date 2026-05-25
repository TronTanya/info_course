import { transitionBase } from "@/lib/design-system/primitives";
import { cn } from "@/lib/utils";

export type ProgressBarProps = {
  value: number;
  max?: number;
  className?: string;
  label?: string;
  tone?: "default" | "success" | "warning" | "danger";
  /** false — перенос длинной подписи; по умолчанию одна строка с ellipsis */
  labelTruncate?: boolean;
};

const toneBar: Record<NonNullable<ProgressBarProps["tone"]>, string> = {
  default: "bg-primary shadow-[0_0_12px_color-mix(in_oklab,var(--primary)_45%,transparent)]",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export function ProgressBar({
  value,
  max = 100,
  className,
  label,
  tone = "default",
  labelTruncate = true,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const progressLabel = label?.trim() || `Прогресс: ${Math.round(pct)}%`;

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {label ? (
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span
            className={cn(
              "min-w-0",
              labelTruncate ? "truncate" : "text-pretty leading-snug wrap-break-word",
            )}
          >
            {label}
          </span>
          <span className="shrink-0 tabular-nums text-foreground" aria-hidden>
            {Math.round(pct)}%
          </span>
        </div>
      ) : null}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted ring-1 ring-inset ring-border"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${Math.round(pct)}%`}
        aria-label={progressLabel}
      >
        <div
          className={cn("h-full rounded-full motion-reduce:transition-none", transitionBase, toneBar[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
