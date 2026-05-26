import { transitionBase } from "@/lib/design-system/primitives";
import { cn } from "@/lib/utils";

export type CircularProgressProps = {
  value: number;
  max?: number;
  /** Diameter in px */
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
  tone?: "default" | "success" | "cyan" | "accent";
  /** Мягкое свечение кольца */
  glow?: boolean;
};

const toneClass: Record<NonNullable<CircularProgressProps["tone"]>, string> = {
  default: "text-primary",
  success: "text-success",
  cyan: "text-cyan",
  accent: "text-accent-foreground",
};

function ringCenterLayout(size: number, label: string) {
  const longLabel = label.length > 11;
  const showLabel = !longLabel || size >= 104;

  const valueClass =
    size >= 120
      ? "text-3xl"
      : size >= 100
        ? "text-2xl"
        : size >= 88
          ? "text-xl"
          : size >= 72
            ? "text-lg"
            : "text-base";

  return {
    showLabel,
    valueClass,
    labelClass: longLabel
      ? "max-w-[92%] text-2 font-medium leading-tight tracking-normal normal-case line-clamp-2"
      : "max-w-[88%] truncate text-2.5 font-medium uppercase tracking-wide",
  };
}

export function CircularProgress({
  value,
  max = 100,
  size = 112,
  strokeWidth = 8,
  className,
  label = "Прогресс",
  tone = "default",
  glow = false,
}: CircularProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference - (pct / 100) * circumference;
  const center = ringCenterLayout(size, label);

  return (
    <div
      className={cn("relative shrink-0", glow && "ce-progress-ring-glow", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${Math.round(pct)}%`}
    >
      <svg width={size} height={size} className="block -rotate-90" aria-hidden>
        <circle className="stroke-muted/80" fill="none" strokeWidth={strokeWidth} r={r} cx={cx} cy={cy} />
        <circle
          className={cn(transitionBase, toneClass[tone])}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          r={r}
          cx={cx}
          cy={cy}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-1 text-center">
        <span
          className={cn(
            "font-display font-bold tabular-nums leading-none text-foreground",
            center.valueClass,
          )}
        >
          {Math.round(pct)}%
        </span>
        {center.showLabel ? (
          <span className={cn("text-subtle-foreground", center.labelClass)}>{label}</span>
        ) : null}
      </div>
    </div>
  );
}
