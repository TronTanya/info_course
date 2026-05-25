import { CertificateProgressOpenedTracker } from "@/components/analytics/learn-screen-trackers";
import { TrackableLink } from "@/components/analytics/trackable-link";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { Award, CheckCircle2, Circle, ListChecks } from "lucide-react";
import type { CertificateProgressPanelView } from "@/lib/certificate-progress-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/ui/circular-progress";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

function statusBadgeVariant(
  status: CertificateProgressPanelView["status"],
): "success" | "primary" | "secondary" | "outline" {
  if (status === "issued") return "success";
  if (status === "ready") return "primary";
  if (status === "almost_ready") return "secondary";
  return "outline";
}

function shellAccent(status: CertificateProgressPanelView["status"]): string {
  switch (status) {
    case "issued":
      return "border-success/30 shadow-[0_0_32px_-12px_hsl(var(--success)/0.3)]";
    case "ready":
      return "border-primary/35 shadow-[0_0_40px_-12px_hsl(var(--primary)/0.28)]";
    case "almost_ready":
      return "border-cyan/25 shadow-[0_0_28px_-12px_hsl(var(--cyan)/0.15)]";
    default:
      return "border-border/80";
  }
}

function RequirementItem({
  label,
  detail,
  met,
}: {
  label: string;
  detail: string;
  met: boolean;
}) {
  return (
    <li
      className={cn(
        "flex items-start gap-3 rounded-xl border px-3 py-2.5",
        met ? "border-success/25 bg-success/5" : "border-border/70 bg-muted/15",
      )}
    >
      {met ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
      ) : (
        <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-pretty text-muted-foreground">{detail}</p>
      </div>
    </li>
  );
}

export function CertificateProgressPanel({
  view,
  className,
}: {
  view: CertificateProgressPanelView;
  className?: string;
}) {
  const ringTone =
    view.status === "issued" ? "success" : view.status === "ready" ? "success" : "default";

  return (
    <>
      <CertificateProgressOpenedTracker source="course_panel" />
    <section
      className={cn(
        "ce-certificate-progress-panel ce-glass flex h-full min-w-0 flex-col rounded-2xl border p-4 sm:p-5 md:p-6",
        shellAccent(view.status),
        className,
      )}
      aria-labelledby="certificate-progress-panel-heading"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
            <Award className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="typo-eyebrow text-primary">Сертификат CyberEdu</p>
            <h2
              id="certificate-progress-panel-heading"
              className="mt-1 font-display text-lg font-semibold text-balance text-foreground sm:text-xl"
            >
              {view.statusLabel}
            </h2>
            <p className="mt-1 text-sm text-pretty leading-relaxed text-muted-foreground">{view.summary}</p>
          </div>
        </div>
        <Badge variant={statusBadgeVariant(view.status)} className="shrink-0 self-start">
          {view.statusLabel}
        </Badge>
      </div>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <ProgressBar
            label="Прогресс до сертификата"
            value={view.percentToCertificate}
            max={100}
            tone={view.status === "issued" || view.status === "ready" ? "success" : "default"}
          />
          <p className="text-xs text-muted-foreground">
            Выполнено {view.completedRequirements.length} из {view.requirements.length} условий
          </p>
        </div>
        <CircularProgress
          value={view.percentToCertificate}
          size={72}
          strokeWidth={6}
          tone={ringTone}
          label="Условия"
          glow={view.status === "ready" || view.status === "issued"}
          className="shrink-0 self-center"
        />
      </div>

      <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-2">
        <div className="min-w-0 space-y-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Выполнено
          </h3>
          {view.completedRequirements.length > 0 ? (
            <ul className="space-y-2">
              {view.completedRequirements.map((req) => (
                <RequirementItem key={req.id} label={req.label} detail={req.detail} met />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Пока нет закрытых условий — начните с первого модуля.</p>
          )}
        </div>

        <div className="min-w-0 space-y-2">
          <h3 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <ListChecks className="size-3.5" aria-hidden />
            Осталось
          </h3>
          {view.remainingRequirements.length > 0 ? (
            <ul className="space-y-2">
              {view.remainingRequirements.map((req) => (
                <RequirementItem key={req.id} label={req.label} detail={req.detail} met={false} />
              ))}
            </ul>
          ) : (
            <p className="text-sm font-medium text-success">Все условия выполнены</p>
          )}
          {view.remainingHints.length > 0 && view.status !== "issued" ? (
            <ul className="mt-3 space-y-1.5 rounded-xl border border-warning/20 bg-warning/5 px-3 py-2 text-xs text-pretty text-muted-foreground">
              {view.remainingHints.map((hint) => (
                <li key={hint} className="flex gap-2">
                  <span className="text-warning" aria-hidden>
                    ·
                  </span>
                  {hint}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="mt-auto flex min-h-12 flex-col gap-2 pt-6 sm:flex-row">
        <Button
          asChild
          variant={view.primaryCta.variant}
          className="min-h-11 w-full focus-visible:ring-2 focus-visible:ring-ring sm:flex-1"
        >
          <TrackableLink
            href={view.primaryCta.href}
            event={AnalyticsEvents.certificateProgressOpened}
            analytics={{ source: "course_panel_primary" }}
          >
            {view.primaryCta.label}
          </TrackableLink>
        </Button>
        {view.secondaryCta ? (
          <Button
            asChild
            variant={view.secondaryCta.variant}
            className="min-h-11 w-full focus-visible:ring-2 focus-visible:ring-ring sm:w-auto"
          >
            <TrackableLink
              href={view.secondaryCta.href}
              event={AnalyticsEvents.certificateProgressOpened}
              analytics={{ source: "course_panel_secondary" }}
            >
              {view.secondaryCta.label}
            </TrackableLink>
          </Button>
        ) : (
          <span className="hidden min-h-11 sm:block sm:min-w-[8rem]" aria-hidden />
        )}
      </div>
    </section>
    </>
  );
}
