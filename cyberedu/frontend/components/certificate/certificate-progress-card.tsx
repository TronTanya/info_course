"use client";

import Link from "next/link";
import { Award, CheckCircle2, Circle, ExternalLink } from "lucide-react";
import type { CertificateProgressCardModel } from "@/lib/certificate-progress-card";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/ui/circular-progress";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

export type CertificateProgressCardProps = {
  model: CertificateProgressCardModel;
  className?: string;
  /** Показывать кольцо прогресса рядом с полосой (по умолчанию да). */
  showRing?: boolean;
  /** Уплотнённый вид в сайдбаре кабинета при завершённом курсе. */
  compact?: boolean;
};

function progressTone(
  status: CertificateProgressCardModel["status"],
): "default" | "success" {
  return status === "issued" || status === "ready" ? "success" : "default";
}

function ringTone(status: CertificateProgressCardModel["status"]): "default" | "success" {
  return status === "issued" || status === "ready" ? "success" : "default";
}

function RequirementList({
  title,
  items,
  emptyHint,
}: {
  title: string;
  items: CertificateProgressCardModel["completedRequirements"];
  emptyHint?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="typo-label text-muted-foreground">{title}</p>
      {items.length > 0 ? (
        <ul className="mt-2 space-y-2" aria-label={title}>
          {items.map((req) => (
            <li key={req.id} className="flex min-w-0 items-start gap-2 text-sm">
              {req.met ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
              ) : (
                <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
              )}
              <span className="min-w-0">
                <span
                  className={cn(
                    "block font-medium",
                    req.met ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {req.label}
                </span>
                <span className="block text-xs text-muted-foreground">{req.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">{emptyHint ?? "—"}</p>
      )}
    </div>
  );
}

export function CertificateProgressCard({
  model,
  className,
  showRing = true,
  compact = false,
}: CertificateProgressCardProps) {
  const tone = progressTone(model.status);
  const showProgressVisual = model.status !== "issued";
  const issued = model.status === "issued";

  return (
    <article
      className={cn("flex min-w-0 flex-col", className)}
      aria-labelledby="certificate-progress-card-title"
    >
      <div className={cn("flex items-start gap-2.5", compact && !showProgressVisual && "gap-2")}>
        {!compact ? (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
            <Award className="size-5" aria-hidden />
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <h3 id="certificate-progress-card-title" className="typo-eyebrow text-primary">
            {model.title}
          </h3>
          {!compact ? (
            <>
              <p className="mt-1 font-display text-base font-semibold text-foreground">{model.headline}</p>
              <p className="mt-1 text-sm text-pretty text-muted-foreground">{model.description}</p>
            </>
          ) : issued ? (
            <p className="mt-0.5 text-sm font-medium text-foreground">{model.headline}</p>
          ) : (
            <p className="mt-0.5 text-sm text-pretty text-muted-foreground">{model.description}</p>
          )}
        </div>
        {showRing && showProgressVisual ? (
          <CircularProgress
            value={model.percentage}
            size={64}
            strokeWidth={5}
            tone={ringTone(model.status)}
            label="%"
            glow={model.status === "ready"}
            className="shrink-0"
            aria-hidden
          />
        ) : null}
      </div>

      {showProgressVisual ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <ProgressBar
            className="min-w-0 flex-1"
            label={model.title}
            value={model.percentage}
            max={100}
            tone={tone}
          />
          <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground sm:hidden">
            {model.percentage}%
          </p>
        </div>
      ) : compact ? null : (
        <p className="mt-4 text-sm font-medium text-success">Программа завершена</p>
      )}

      <div
        className={cn(
          compact ? "mt-3" : "mt-4",
          compact || model.remainingRequirements.length === 0
            ? "grid gap-2.5"
            : "grid gap-4 sm:grid-cols-2",
        )}
      >
        <RequirementList
          title={compact ? "Чеклист" : "Выполнено"}
          items={model.completedRequirements}
          emptyHint="Пока нет закрытых условий."
        />
        {!compact ? (
          <RequirementList
            title="Осталось"
            items={model.remainingRequirements}
            emptyHint={
              model.status === "ready" || model.status === "issued"
                ? "Все условия выполнены."
                : "Следуйте чеклисту выше."
            }
          />
        ) : null}
      </div>

      <div
        className={cn(
          "mt-auto flex flex-col gap-2.5 sm:flex-row sm:flex-wrap",
          compact ? "pt-4" : "pt-5",
        )}
      >
        <Button
          asChild
          variant={model.status === "ready" || model.status === "issued" ? "primary" : "outline"}
          className="min-h-10 w-full touch-manipulation sm:w-auto"
        >
          {model.primaryCta.external ? (
            <a
              href={model.primaryCta.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5"
            >
              {model.primaryCta.label}
            </a>
          ) : (
            <Link href={model.primaryCta.href}>{model.primaryCta.label}</Link>
          )}
        </Button>
        {model.secondaryCta ? (
          <Button
            asChild
            variant="ghost"
            className={cn("min-h-10 w-full sm:w-auto", compact && "px-2")}
          >
            {model.secondaryCta.external ? (
              <a
                href={model.secondaryCta.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5"
              >
                {model.secondaryCta.label}
                <ExternalLink className="size-3.5 shrink-0 opacity-80" aria-hidden />
              </a>
            ) : (
              <Link href={model.secondaryCta.href}>{model.secondaryCta.label}</Link>
            )}
          </Button>
        ) : null}
      </div>
    </article>
  );
}
