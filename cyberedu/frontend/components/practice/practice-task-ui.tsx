import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";

export type PracticeResultTone = "success" | "good" | "retry" | "fail";

const RESULT_TONE_CLASS: Record<PracticeResultTone, string> = {
  success: "border-success/40 bg-success/10",
  good: "border-primary/35 bg-primary/10",
  retry: "border-warning/40 bg-warning/10",
  fail: "border-danger/30 bg-danger/5",
};

export function practiceChipClass(on: boolean, locked: boolean, className?: string) {
  return cn(
    "rounded-md px-1 py-0.5 text-left transition-colors outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
    on ? "bg-success/20 text-success ring-2 ring-success/50" : "bg-transparent text-inherit hover:bg-muted/50",
    locked ? "cursor-default opacity-90" : "cursor-pointer",
    className,
  );
}

export function practiceToggleClass(active: boolean, locked: boolean, variant: "safe" | "unsafe" | "neutral" = "neutral") {
  const activeClass =
    variant === "safe"
      ? "border-success/50 bg-success/15 text-success"
      : variant === "unsafe"
        ? "border-danger/50 bg-danger/10 text-danger"
        : "border-primary/50 bg-primary/10 text-primary";
  return cn(
    "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
    active ? activeClass : "border-border bg-card hover:bg-muted/50",
    locked && "opacity-80",
  );
}

export function PracticeTaskBanner({
  children,
  badge,
  variant = "warning",
}: {
  children: ReactNode;
  badge: string;
  variant?: "warning" | "cyan" | "success";
}) {
  const borderClass =
    variant === "cyan"
      ? "border-cyan/25 bg-cyan/5"
      : variant === "success"
        ? "border-success/25 bg-success/5"
        : "border-warning/30 bg-warning/5";
  const badgeVariant = variant === "cyan" ? "cyan" : variant === "success" ? "success" : "warning";

  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs text-muted-foreground", borderClass)}>
      <span>{children}</span>
      <Badge variant={badgeVariant} className="shrink-0">
        {badge}
      </Badge>
    </div>
  );
}

export function PracticeTaskHint({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/20 px-3 py-3 text-xs text-muted-foreground">
      <p className="font-medium text-foreground">{title}</p>
      <div className="mt-1 space-y-1">{children}</div>
    </div>
  );
}

export function PracticeTaskResult({
  tone,
  title,
  feedback,
  footer,
}: {
  tone: PracticeResultTone;
  title: string;
  feedback: string;
  footer?: ReactNode;
}) {
  return (
    <div className={cn("rounded-xl border px-4 py-3 text-sm", RESULT_TONE_CLASS[tone])}>
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-muted-foreground">{feedback}</p>
      {footer ? <div className="mt-2">{footer}</div> : null}
    </div>
  );
}

export function PracticeTaskStep({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <SectionCard variant="lab" title={title} flushTitle className={cn("space-y-3", className)}>
      {children}
    </SectionCard>
  );
}

export function PracticeEmailPanel({
  header,
  badge,
  children,
}: {
  header: string;
  badge: string;
  children: ReactNode;
}) {
  return (
    <SectionCard variant="lab" flushTitle className="overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{header}</p>
        <Badge variant="warning" className="text-2.5">
          {badge}
        </Badge>
      </div>
      <div className="space-y-4 px-4 py-5 sm:px-6">{children}</div>
    </SectionCard>
  );
}
