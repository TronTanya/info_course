"use client";

import Link from "next/link";
import { Award, CheckCircle2, Circle } from "lucide-react";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import { computeStepMetrics, getCertificateEligibility } from "@/lib/dashboard-ui";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { CockpitWidget, CockpitWidgetHeader } from "@/components/dashboard/cockpit/cockpit-widget";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

export function DashboardCertificateProgress({
  stats,
  modules,
}: {
  stats: ProfileCourseStats;
  modules: CourseProgressModuleRow[];
}) {
  const metrics = computeStepMetrics(modules);
  const eligibility = getCertificateEligibility(stats, metrics);

  const modulesDone = stats.completedModules;
  const modulesTotal = stats.totalModules || 1;

  return (
    <CockpitWidget variant="accent" className="flex h-full min-w-0 flex-col" aria-labelledby="dash-cert-heading">
      <CockpitWidgetHeader
        titleId="dash-cert-heading"
        eyebrow="Сертификат"
        title="Сертификат"
        action={
          <span className="flex size-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
            <Award className="size-5" aria-hidden />
          </span>
        }
      />
      <h3 className="font-heading text-lg font-semibold text-balance text-foreground">
        {eligibility.title}
      </h3>
      <p className="mt-1 text-sm text-pretty text-muted-foreground wrap-anywhere">
        {eligibility.description}
      </p>

      {!stats.certificateIssued ? (
        <ProgressBar
          className="mt-4"
          label="Модули программы"
          value={modulesDone}
          max={modulesTotal}
          tone={stats.allModulesComplete ? "success" : "default"}
        />
      ) : (
        <p className="mt-4 text-sm font-medium text-success">Все требования выполнены</p>
      )}

      <ul className="mt-4 space-y-2">
        {eligibility.requirements.map((req) => (
          <li key={req.label} className="flex min-w-0 items-start gap-2 text-sm">
            {req.met ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
            ) : (
              <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            )}
            <span className={cn("min-w-0 wrap-break-word", req.met ? "text-foreground" : "text-muted-foreground")}>
              {req.label}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-5">
        <Button
          asChild
          variant={stats.certificateIssued || stats.canGenerateCertificate ? "primary" : "outline"}
          className="w-full sm:w-auto"
        >
          <Link href={eligibility.ctaHref}>{eligibility.ctaLabel}</Link>
        </Button>
      </div>
    </CockpitWidget>
  );
}
