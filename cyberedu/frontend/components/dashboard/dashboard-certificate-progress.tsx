import Link from "next/link";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionHeader } from "@/components/ui/section-header";

export function DashboardCertificateProgress({ stats }: { stats: ProfileCourseStats }) {
  const modulesDone = stats.completedModules;
  const modulesTotal = stats.totalModules;
  const modulesPct = modulesTotal > 0 ? Math.round((modulesDone / modulesTotal) * 100) : 0;

  let title: string;
  let description: string;
  const ctaHref = "/dashboard/certificate";
  let ctaLabel = "Открыть сертификат";

  if (stats.certificateIssued) {
    title = "Сертификат выдан";
    description = `Номер ${stats.certificateNumber ?? "—"}. Скачайте PDF и передайте ссылку на проверку.`;
    ctaLabel = "Скачать и проверить";
  } else if (stats.allModulesComplete && stats.canGenerateCertificate) {
    title = "Сертификат доступен";
    description = "Все модули завершены — сгенерируйте документ в разделе сертификата.";
    ctaLabel = "Получить сертификат";
  } else {
    title = `До сертификата: ${stats.modulesUntilCertificate} ${pluralModules(stats.modulesUntilCertificate)}`;
    description = "Завершите оставшиеся модули курса — после этого откроется выдача сертификата.";
    ctaLabel = "Смотреть прогресс";
  }

  return (
    <section className="space-y-4" aria-labelledby="dash-cert-heading">
      <SectionHeader title="Прогресс к сертификату" description={description} />
      <h2 id="dash-cert-heading" className="sr-only">
        Прогресс к сертификату
      </h2>
      <GlassCard glow className="space-y-4 p-5 sm:p-6">
        <p className="font-display text-lg font-semibold text-foreground">{title}</p>
        {!stats.certificateIssued ? (
          <ProgressBar
            label="Модули до выдачи"
            value={modulesDone}
            max={modulesTotal || 1}
            tone={stats.allModulesComplete ? "success" : "default"}
          />
        ) : (
          <p className="text-sm text-success">100% программы пройдено</p>
        )}
        <p className="typo-caption">Завершено {modulesDone} из {modulesTotal} модулей ({modulesPct}%)</p>
        <Button asChild variant={stats.certificateIssued || stats.canGenerateCertificate ? "primary" : "outline"}>
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      </GlassCard>
    </section>
  );
}

function pluralModules(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "модуль";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "модуля";
  return "модулей";
}
