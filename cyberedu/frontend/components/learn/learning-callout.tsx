import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export type LearningCalloutVariant = "info" | "warning" | "danger" | "success";

const styles: Record<
  LearningCalloutVariant,
  { shell: string; label: string; icon: typeof Info }
> = {
  info: {
    shell: "border-primary/30 bg-primary/6 ring-primary/15",
    label: "text-primary",
    icon: Info,
  },
  warning: {
    shell: "border-warning/35 bg-warning/8 ring-warning/20",
    label: "text-warning",
    icon: AlertTriangle,
  },
  danger: {
    shell: "border-danger/35 bg-danger/8 ring-danger/20",
    label: "text-danger",
    icon: ShieldAlert,
  },
  success: {
    shell: "border-success/35 bg-success/8 ring-success/20",
    label: "text-success",
    icon: CheckCircle2,
  },
};

const defaultLabels: Record<LearningCalloutVariant, string> = {
  info: "Информация",
  warning: "Важно",
  danger: "Осторожно",
  success: "Итог",
};

export function LearningCallout({
  variant,
  title,
  label,
  children,
  className,
}: {
  variant: LearningCalloutVariant;
  title?: string;
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  const s = styles[variant];
  const Icon = s.icon;
  const eyebrow = label ?? defaultLabels[variant];

  return (
    <section
      className={cn(
        "flex gap-3 rounded-2xl border px-4 py-4 ring-1 ring-inset sm:px-5 sm:py-4",
        s.shell,
        className,
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl bg-card/80 ring-1 ring-border/60",
          s.label,
        )}
        aria-hidden
      >
        <Icon className="size-4" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("text-xs font-semibold uppercase tracking-wide", s.label)}>{eyebrow}</p>
        {title ? <h3 className="mt-1 text-base font-semibold text-foreground">{title}</h3> : null}
        <div className="mt-2 text-base leading-relaxed text-foreground/90">{children}</div>
      </div>
    </section>
  );
}
