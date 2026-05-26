import Link from "next/link";
import { BookOpen, ClipboardCheck, FlaskConical, type LucideIcon } from "lucide-react";
import type { DashboardNextStepCard as NextStep } from "@/lib/dashboard-ui";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";

const ICONS: Record<NextStep["kind"], LucideIcon> = {
  lesson: BookOpen,
  test: ClipboardCheck,
  practice: FlaskConical,
};

export function DashboardNextStepCard({ card }: { card: NextStep }) {
  const Icon = ICONS[card.kind];
  const disabled = card.empty;

  return (
    <SectionCard
      variant="default"
      flushTitle
      className={cn(
        "flex h-full flex-col transition-colors transition-shadow duration-200",
        !disabled && "hover:border-primary/25 hover:shadow-card-hover",
        disabled && "opacity-90",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl border",
            disabled ? "border-border bg-muted/40 text-muted-foreground" : "border-primary/20 bg-primary/10 text-primary",
          )}
        >
          <Icon className="size-5" strokeWidth={1.75} aria-hidden />
        </span>
        <span className="rounded-md border border-border/80 bg-muted/30 px-2 py-0.5 text-2.5 font-medium uppercase tracking-wide text-muted-foreground">
          {card.statusLabel}
        </span>
      </div>
      <h3 className="mt-3 font-display text-base font-semibold leading-snug text-foreground">{card.title}</h3>
      <p className="mt-1 flex-1 text-sm text-muted-foreground">{card.moduleTitle}</p>
      <Link
        href={card.href}
        className={cn(
          "mt-4 inline-flex min-h-11 items-center text-sm font-semibold",
          disabled ? "text-muted-foreground" : "text-primary underline-offset-4 hover:underline",
          "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring rounded-sm",
        )}
      >
        {disabled ? "Открыть карту курса" : card.kind === "lesson" ? "Открыть лекцию" : card.kind === "test" ? "К тесту" : "К практике"}
      </Link>
    </SectionCard>
  );
}
