"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, FlaskConical, Play, RotateCcw } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  buildPracticeLabBreadcrumbs,
  isPracticeSubmitDisabled,
  practiceHeaderMetaChips,
  practiceHeaderScoreLine,
  practiceLabHeaderStatusTone,
  PRACTICE_LAB_BADGE,
  PRACTICE_VIEW_STATUS_LABELS,
  resolvePracticeLabHeaderCtas,
  type PracticeLabHeaderCta,
  type PracticeLabHeaderStatusTone,
} from "@/lib/practice-lab-header-ui";
import {
  practiceLabTitleId,
  practiceSubmitDisabledReasonId,
} from "@/lib/practice-a11y";
import type { PracticeViewModel } from "@/types/practice-view-model";
import { cn } from "@/lib/utils";

const toneBadgeClass: Record<PracticeLabHeaderStatusTone, string> = {
  muted: "border-border/80 bg-muted/25 text-muted-foreground",
  primary: "border-primary/40 bg-primary/15 text-primary",
  warning: "border-warning/45 bg-warning/12 text-warning",
  success: "border-success/40 bg-success/12 text-success",
  danger: "border-danger/45 bg-danger/12 text-danger",
};

function CtaIcon({ kind }: { kind: PracticeLabHeaderCta["kind"] }) {
  switch (kind) {
    case "course":
      return <ArrowLeft className="size-4 shrink-0" aria-hidden />;
    case "continue":
      return <Play className="size-4 shrink-0" aria-hidden />;
    case "retry":
      return <RotateCcw className="size-4 shrink-0" aria-hidden />;
    case "next":
      return <ArrowRight className="size-4 shrink-0" aria-hidden />;
    default:
      return null;
  }
}

function scrollToAnchor(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export type PracticeLabHeaderProps = {
  view: PracticeViewModel;
  courseTitle: string;
  courseHref?: string;
  moduleHref: string;
  /** id блока рабочей области для CTA «Продолжить» / «Повторить» */
  workspaceAnchorId?: string;
  onRetry?: () => void;
  /** 1 — единственное задание на странице; 2 — при нескольких заданиях (одна h1 на страницу). */
  titleLevel?: 1 | 2;
  className?: string;
};

export function PracticeLabHeader({
  view,
  courseTitle,
  courseHref = "/dashboard/course",
  moduleHref,
  workspaceAnchorId,
  onRetry,
  titleLevel = 1,
  className,
}: PracticeLabHeaderProps) {
  const TitleTag = titleLevel === 1 ? "h1" : "h2";
  const titleId = practiceLabTitleId(view.id);
  const submitDisabledReasonId = practiceSubmitDisabledReasonId(view.id);
  const statusLabel = PRACTICE_VIEW_STATUS_LABELS[view.status];
  const statusTone = practiceLabHeaderStatusTone[view.status];
  const breadcrumbs = buildPracticeLabBreadcrumbs({
    courseTitle,
    courseHref,
    moduleTitle: view.moduleTitle,
    moduleHref,
  });
  const metaChips = practiceHeaderMetaChips(view);
  const scoreLine = practiceHeaderScoreLine(view.submission, view.submission?.maxScore);
  const submitDisabled = isPracticeSubmitDisabled(view);
  const ctas = resolvePracticeLabHeaderCtas(view, {
    courseHref,
    workspaceAnchorId,
  });

  return (
    <section
      className={cn(
        "ce-practice-lab-header ce-glass relative overflow-hidden rounded-2xl",
        "border border-primary/20 bg-linear-to-br from-card/85 via-card/70 to-primary/[0.07]",
        "shadow-[0_0_40px_-16px_hsl(var(--primary)/0.45)] ring-1 ring-primary/10",
        "p-4 sm:p-6",
        className,
      )}
      aria-labelledby={`practice-lab-title-${view.id}`}
      data-practice-submit-disabled={submitDisabled ? "true" : "false"}
    >
      <div className="ce-tech-grid pointer-events-none absolute inset-0 opacity-[0.14]" aria-hidden />
      <div
        className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-primary/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 left-1/3 size-48 rounded-full bg-cyan/10 blur-3xl"
        aria-hidden
      />

      <div className="relative space-y-4">
        <div
          className={cn(
            "rounded-xl border border-border/45 bg-background/25 px-3 py-2.5 sm:px-4",
            "bg-linear-to-r from-card/60 via-transparent to-primary/[0.03]",
          )}
        >
          <Breadcrumbs items={breadcrumbs} compact className="text-[11px] sm:text-sm" aria-label="Курс, модуль и практика" />
        </div>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="gap-1.5 border-primary/35 bg-primary/10 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-primary"
              >
                <FlaskConical className="size-3.5" aria-hidden />
                {PRACTICE_LAB_BADGE}
              </Badge>
              <Badge
                className={cn(
                  "font-mono text-[10px] font-semibold uppercase tracking-wider",
                  toneBadgeClass[statusTone],
                )}
                aria-label={`Статус задания: ${statusLabel}`}
              >
                {statusLabel}
              </Badge>
              {scoreLine ? (
                <span className="rounded-lg border border-border/60 bg-muted/20 px-2.5 py-1 font-mono text-[11px] tabular-nums text-muted-foreground">
                  {scoreLine}
                </span>
              ) : null}
            </div>

            <div className="space-y-2">
              <TitleTag
                id={titleId}
                className="font-display text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl lg:text-[1.65rem]"
              >
                {view.title}
              </TitleTag>
              {view.description ? (
                <p className="max-w-3xl break-words text-pretty text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
                  {view.description}
                </p>
              ) : null}
            </div>

            <p className="text-sm text-muted-foreground">
              <span className="text-foreground/80">Модуль:</span> {view.moduleTitle}
            </p>

            {metaChips.length > 0 ? (
              <ul className="flex flex-wrap gap-2" role="list">
                {metaChips.map((chip) => (
                  <li key={chip}>
                    <Badge variant="outline" className="border-border/70 bg-background/30 font-normal text-xs">
                      {chip}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : null}

            {view.status === "locked" && view.lockedReason ? (
              <p
                className="rounded-xl border border-warning/30 bg-warning/8 px-3 py-2.5 text-sm text-warning"
                role="status"
              >
                {view.lockedReason}
              </p>
            ) : null}

            {submitDisabled && view.status !== "locked" ? (
              <p
                id={submitDisabledReasonId}
                className="text-xs text-muted-foreground"
                role="status"
              >
                Отправка ответа временно недоступна — дождитесь проверки или откройте задание после доработки.
              </p>
            ) : null}
          </div>

          <div className="flex w-full shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap lg:w-auto lg:max-w-xs lg:flex-col">
            {ctas.map((cta) => (
              <PracticeLabHeaderCtaButton
                key={cta.kind}
                cta={cta}
                onRetry={cta.kind === "retry" ? onRetry : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PracticeLabHeaderCtaButton({
  cta,
  onRetry,
}: {
  cta: PracticeLabHeaderCta;
  onRetry?: () => void;
}) {
  const icon = <CtaIcon kind={cta.kind} />;
  const className = cn("min-h-11 w-full gap-2 sm:w-auto lg:w-full", cta.variant === "primary" && "shadow-glow-sm");

  if (cta.href && cta.kind !== "continue" && cta.kind !== "retry") {
    return (
      <Button asChild variant={cta.variant} className={className}>
        <Link href={cta.href}>
          {icon}
          {cta.label}
        </Link>
      </Button>
    );
  }

  if (cta.scrollToId || cta.kind === "retry") {
    return (
      <Button
        type="button"
        variant={cta.variant}
        className={className}
        onClick={() => {
          if (cta.kind === "retry") onRetry?.();
          if (cta.scrollToId) scrollToAnchor(cta.scrollToId);
        }}
      >
        {icon}
        {cta.label}
      </Button>
    );
  }

  if (cta.href) {
    return (
      <Button asChild variant={cta.variant} className={className}>
        <Link href={cta.href}>
          {icon}
          {cta.label}
        </Link>
      </Button>
    );
  }

  return null;
}
