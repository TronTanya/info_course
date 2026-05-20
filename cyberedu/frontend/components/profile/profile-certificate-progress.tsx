import Link from "next/link";
import { Award, CheckCircle2, Circle } from "lucide-react";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import { certificateProgressLabel } from "@/lib/profile-ui";
import { computeStepMetrics, getCertificateEligibility } from "@/lib/dashboard-ui";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";

export function ProfileCertificateProgress({
  stats,
  modules = [],
}: {
  stats: ProfileCourseStats;
  modules?: CourseProgressModuleRow[];
}) {
  const metrics = computeStepMetrics(modules);
  const eligibility = getCertificateEligibility(stats, metrics);
  const certPercent =
    stats.totalModules > 0 ? Math.round((stats.completedModules / stats.totalModules) * 100) : 0;
  const tone = stats.certificateIssued || stats.allModulesComplete ? "success" : "default";

  return (
    <SectionCard variant="lab" flushTitle className="p-4 sm:p-6" aria-labelledby="profile-cert-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="profile-cert-heading" className="font-display text-base font-semibold text-foreground sm:text-lg">
            Сертификат
          </h2>
          <p className="mt-1 text-sm font-medium text-foreground">{eligibility.title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{eligibility.description}</p>
          <p className="mt-1 text-xs text-muted-foreground">{certificateProgressLabel(stats)}</p>
        </div>
        <Link
          href="/dashboard/certificate"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          <Award className="size-4" aria-hidden />
          Страница сертификата
        </Link>
      </div>

      <ProgressBar
        className="mt-5"
        label="Завершение модулей для выдачи сертификата"
        value={certPercent}
        max={100}
        tone={tone}
      />

      <ul className="mt-4 space-y-2">
        {eligibility.requirements.map((req) => (
          <li key={req.label} className="flex items-center gap-2 text-sm">
            {req.met ? (
              <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden />
            ) : (
              <Circle className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            )}
            <span className={cn(req.met ? "text-foreground" : "text-muted-foreground")}>{req.label}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 border-t border-border/60 pt-6">
        <Button asChild variant={stats.certificateIssued || stats.canGenerateCertificate ? "primary" : "outline"}>
          <Link href={eligibility.ctaHref}>{eligibility.ctaLabel}</Link>
        </Button>
      </div>
    </SectionCard>
  );
}
