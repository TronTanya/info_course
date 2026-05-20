"use client";

import Link from "next/link";
import { Award, CheckCircle2, Circle } from "lucide-react";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import { computeStepMetrics, getCertificateEligibility } from "@/lib/dashboard-ui";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
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
    <PremiumCard variant="glow" padding="md" className="flex h-full min-w-0 flex-col" aria-labelledby="dash-cert-heading">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
          <Award className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p id="dash-cert-heading" className="typo-eyebrow text-primary">
            Certificate progress
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold text-balance text-foreground">{eligibility.title}</h3>
          <p className="mt-1 break-words text-sm text-pretty text-muted-foreground [overflow-wrap:anywhere]">
            {eligibility.description}
          </p>
        </div>
      </div>

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
            <span className={cn("min-w-0 break-words", req.met ? "text-foreground" : "text-muted-foreground")}>
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
    </PremiumCard>
  );
}
