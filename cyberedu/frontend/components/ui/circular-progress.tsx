import { transitionBase } from "@/lib/design-system/primitives";
import { cn } from "@/lib/utils";

export type CircularProgressProps = {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
  tone?: "default" | "success" | "cyan" | "accent";
};

const toneClass: Record<NonNullable<CircularProgressProps["tone"]>, string> = {
  default: "text-primary",
  success: "text-success",
  cyan: "text-cyan",
  accent: "text-accent-foreground",
};

export function CircularProgress({
  value,
  max = 100,
  size = 112,
  strokeWidth = 8,
  className,
  label = "Прогресс",
  tone = "default",
}: CircularProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <div
      className={cn("relative shrink-0", className)}
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
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-2xl font-bold tabular-nums leading-none text-foreground sm:text-3xl">
          {Math.round(pct)}%
        </span>
        <span className="mt-0.5 max-w-[80%] truncate text-[10px] font-medium uppercase tracking-wide text-subtle-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}
