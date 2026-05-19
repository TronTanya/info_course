import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cyber } from "@/lib/design-system/cyber";
import { cn } from "@/lib/utils";

export function CyberPageHeader({
  backHref,
  backLabel = "← Назад",
  breadcrumbItems,
  eyebrow,
  title,
  subtitle,
  moduleProgressPercent,
  moduleStepsLabel,
  actions,
  className,
  layout = "stack",
}: {
  backHref?: string;
  backLabel?: string;
  breadcrumbItems?: BreadcrumbItem[];
  eyebrow?: string;
  title: string;
  subtitle?: string;
  moduleProgressPercent?: number;
  moduleStepsLabel?: string;
  actions?: ReactNode;
  className?: string;
  layout?: "stack" | "split";
}) {
  const hasProgress = moduleProgressPercent !== undefined && moduleStepsLabel;

  return (
    <header
      className={cn(
        cyber.pageHeader,
        layout === "split" && "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start">
        {backHref ? (
          <Link href={backHref} className={cyber.backLink}>
            {backLabel}
          </Link>
        ) : null}
        <div className="min-w-0 space-y-2">
          {breadcrumbItems?.length ? <Breadcrumbs items={breadcrumbItems} /> : null}
          {eyebrow ? <p className={cyber.eyebrow}>{eyebrow}</p> : null}
          <h1 className="typo-h2 text-balance sm:text-2xl">{title}</h1>
          {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>
      {hasProgress ? (
        <ModuleProgressAside percent={moduleProgressPercent} stepsLabel={moduleStepsLabel} />
      ) : null}
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

function ModuleProgressAside({ percent, stepsLabel }: { percent: number; stepsLabel: string }) {
  return (
    <div className="w-full shrink-0 space-y-2 sm:max-w-[220px]">
      <div className="flex items-end justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">Прогресс модуля</p>
        <span className="text-sm font-semibold tabular-nums text-foreground">{percent}%</span>
      </div>
      <ProgressBar value={percent} max={100} label={`Шаги: ${stepsLabel}`} />
    </div>
  );
}
