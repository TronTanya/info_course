import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { AdminKpiCardsInput } from "@/lib/admin-kpi-cards";
import {
  buildAdminKpiCardsView,
  resolveAdminKpiCardsInput,
  type AdminKpiCardTone,
  type AdminKpiCardView,
} from "@/lib/admin-kpi-cards";
import type { AdminControlCenterKpis } from "@/lib/admin-control-center";
import { cyber } from "@/lib/design-system/cyber";
import { cn } from "@/lib/utils";

const TONE_BAR: Record<AdminKpiCardTone, string> = {
  default: "from-cyan/60",
  primary: "from-primary/80",
  success: "from-success/80",
  warning: "from-warning/80",
  danger: "from-danger/80",
};

function KpiTrend({ trend }: { trend: NonNullable<AdminKpiCardView["trend"]> }) {
  const Icon =
    trend.direction === "up" ? TrendingUp : trend.direction === "down" ? TrendingDown : Minus;
  const color =
    trend.direction === "up"
      ? "text-warning"
      : trend.direction === "down"
        ? "text-success"
        : "text-muted-foreground";

  return (
    <p className={cn("mt-2 flex items-center gap-1 text-[11px] font-medium", color)}>
      <Icon className="size-3 shrink-0" aria-hidden />
      <span>{trend.label}</span>
    </p>
  );
}

function AdminKpiCard({ card }: { card: AdminKpiCardView }) {
  const isEmpty = card.value === "—";

  return (
    <article
      className={cn(cyber.adminKpi, "group relative min-w-0 overflow-hidden rounded-2xl border pt-0")}
    >
      <div
        className={cn("h-1 w-full bg-linear-to-r via-accent/30 to-transparent", TONE_BAR[card.tone])}
        aria-hidden
      />
      <div className="px-4 pb-4 pt-4">
        <p className="line-clamp-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[11px]">
          {card.label}
        </p>
        <p
          className={cn(
            "mt-1.5 font-display text-2xl font-bold tabular-nums tracking-tight sm:mt-2 sm:text-3xl lg:text-4xl",
            isEmpty ? "text-muted-foreground" : "text-foreground",
          )}
          title={card.titleAttr}
        >
          {card.value}
        </p>
        {isEmpty && card.emptyHint ? (
          <p className="mt-1 text-[11px] font-medium text-muted-foreground" title={card.emptyHint}>
            {card.emptyHint}
          </p>
        ) : null}
        <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-pretty text-muted-foreground sm:text-xs">
          {card.description}
        </p>
        {card.trend ? <KpiTrend trend={card.trend} /> : null}
      </div>
    </article>
  );
}

export function AdminKpiCards({
  data,
  className,
}: {
  data: AdminKpiCardsInput | AdminControlCenterKpis;
  className?: string;
}) {
  const cards = buildAdminKpiCardsView(resolveAdminKpiCardsInput(data));

  return (
    <section aria-labelledby="admin-kpi-cards-heading" className={className}>
      <h2 id="admin-kpi-cards-heading" className="sr-only">
        Ключевые показатели
      </h2>
      <div className="grid min-w-0 grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3 2xl:grid-cols-6">
        {cards.map((card) => (
          <AdminKpiCard key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}
