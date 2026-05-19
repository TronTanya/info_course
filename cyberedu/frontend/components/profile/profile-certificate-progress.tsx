import Link from "next/link";
import { Award } from "lucide-react";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import { certificateProgressLabel } from "@/lib/profile-ui";
import { CertificatePanel } from "@/components/certificate/certificate-panel";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionCard } from "@/components/ui/section-card";

export function ProfileCertificateProgress({ stats }: { stats: ProfileCourseStats }) {
  const certPercent =
    stats.totalModules > 0 ? Math.round((stats.completedModules / stats.totalModules) * 100) : 0;
  const tone = stats.certificateIssued || stats.allModulesComplete ? "success" : "default";

  const certificatePayload =
    stats.certificateId && stats.certificateNumber && stats.issuedAt && stats.certificateVerifyUrl
      ? {
          id: stats.certificateId,
          certificateNumber: stats.certificateNumber,
          issuedAt: stats.issuedAt.toISOString(),
          verifyUrl: stats.certificateVerifyUrl,
        }
      : null;

  return (
    <SectionCard variant="lab" flushTitle className="p-4 sm:p-6" aria-labelledby="profile-cert-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="profile-cert-heading" className="font-display text-base font-semibold text-foreground sm:text-lg">
            Прогресс до сертификата
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{certificateProgressLabel(stats)}</p>
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

      {stats.modulesUntilCertificate > 0 && !stats.certificateIssued ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Осталось завершить{" "}
          <span className="font-semibold text-foreground">{stats.modulesUntilCertificate}</span>{" "}
          {stats.modulesUntilCertificate === 1 ? "модуль" : "модулей"}.
        </p>
      ) : null}

      <div className="mt-6 border-t border-border/60 pt-6">
        <CertificatePanel
          courseId={stats.courseId}
          courseCompleted={stats.allModulesComplete}
          certificate={certificatePayload}
          generateButtonText="Получить сертификат"
          downloadButtonText="Скачать сертификат"
        />
      </div>
    </SectionCard>
  );
}
