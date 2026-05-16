import Link from "next/link";
import type { AchievementRow } from "@/lib/achievements";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import { ProfileAchievements } from "@/components/profile/profile-achievements";
import { CertificatePanel } from "@/components/certificate/certificate-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

/** Кольцевой индикатор общего прогресса курса. */
function CourseProgressRing({ percent }: { percent: number }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = c - (clamped / 100) * c;
  return (
    <div className="relative flex size-30 shrink-0 items-center justify-center" aria-hidden>
      <svg viewBox="0 0 112 112" className="size-full -rotate-90 text-primary">
        <circle cx="56" cy="56" r={r} fill="none" stroke="currentColor" className="text-muted/25" strokeWidth="10" />
        <circle
          cx="56"
          cy="56"
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-primary drop-shadow-sm"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-center">
        <span className="block text-2xl font-bold tabular-nums text-foreground">{clamped}%</span>
      </span>
    </div>
  );
}

const cardShell =
  "relative overflow-hidden rounded-2xl border border-border/70 bg-card/95 p-6 shadow-(--shadow-card) ring-1 ring-secondary/5 sm:p-8";

export type ProfileProgressOverviewProps = {
  stats: ProfileCourseStats;
  achievements: AchievementRow[];
  /** Текст интересов для блока AI (уже отформатирован). */
  interestsDisplay: string;
  hasInterestsForAi: boolean;
};

export function ProfileProgressOverview({
  stats,
  achievements,
  interestsDisplay,
  hasInterestsForAi,
}: ProfileProgressOverviewProps) {
  const continueHref = stats.currentModuleId
    ? `/dashboard/course/${stats.currentModuleId}`
    : "/dashboard/course";

  const scoreBarMax = Math.max(1, stats.maxPossiblePoints);
  const scoreTone: "default" | "success" | "warning" =
    stats.maxPossiblePoints <= 0
      ? "default"
      : stats.scoreSuccessPercent >= 70
        ? "success"
        : stats.scoreSuccessPercent >= 40
          ? "warning"
          : "default";

  const progressTone: "default" | "success" = stats.progressPercent >= 100 ? "success" : "default";

  const certificatePayload =
    stats.certificateId && stats.certificateNumber && stats.issuedAt && stats.certificateVerifyUrl
      ? {
          id: stats.certificateId,
          certificateNumber: stats.certificateNumber,
          issuedAt: stats.issuedAt.toISOString(),
          verifyUrl: stats.certificateVerifyUrl,
        }
      : null;

  const interestsEmpty = !hasInterestsForAi || interestsDisplay.trim().length === 0;

  return (
    <div className="space-y-6">
      <section
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border/70 bg-linear-to-br from-primary/6 via-card to-cyan/6 p-6 shadow-(--shadow-card) ring-1 ring-secondary/5 sm:p-8",
        )}
      >
        <div className="pointer-events-none absolute -right-20 top-0 h-48 w-48 rounded-full bg-cyan/10 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="typo-eyebrow text-primary">Ваш курс</p>
            <h2 className="typo-h2 mt-1">{stats.courseTitle}</h2>
            <p className="typo-body-muted mt-2 max-w-2xl">
              Здесь видно, как вы движетесь по программе: модули, баллы и следующий шаг.
            </p>
          </div>
          <Badge variant={stats.allModulesComplete ? "success" : "secondary"} className="w-fit shrink-0">
            {stats.allModulesComplete ? "Курс пройден" : "Учитесь в своём темпе"}
          </Badge>
        </div>
      </section>

      <section className={cardShell}>
        <h3 className="typo-h3">Прогресс</h3>
        <p className="typo-body-muted mt-1">Общая доля пройденного материала и зачёт по модулям.</p>
        <div className="mt-6 flex flex-col items-stretch gap-6 sm:flex-row sm:items-center">
          <CourseProgressRing percent={stats.progressPercent} />
          <div className="min-w-0 flex-1">
            <p className="typo-h3 text-foreground">
              Завершено модулей{" "}
              <span className="text-primary">
                {stats.completedModules} из {stats.totalModules}
              </span>
            </p>
            <ProgressBar
              className="mt-4"
              value={stats.progressPercent}
              max={100}
              label={`Общий прогресс курса: ${stats.progressPercent}%`}
              tone={progressTone}
            />
          </div>
        </div>

        <div className="mt-8 border-t border-border/60 pt-8">
          <h4 className="typo-h3">Баллы</h4>
          <p className="typo-caption mt-1">Сумма за тесты и принятую практику.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 min-[1920px]:grid-cols-4">
            <MetricCard label="Набрано баллов" value={`${stats.totalPoints}`} />
            <MetricCard
              label="Максимум по курсу"
              value={stats.maxPossiblePoints > 0 ? `${stats.maxPossiblePoints}` : "—"}
              hint={stats.maxPossiblePoints <= 0 ? "Пока нет настроенных балльных заданий" : undefined}
            />
            <MetricCard
              label="Успешность"
              value={stats.maxPossiblePoints > 0 ? `${stats.scoreSuccessPercent}%` : "—"}
              hint={stats.maxPossiblePoints > 0 ? "доля от максимума" : undefined}
            />
          </div>
          {stats.maxPossiblePoints > 0 ? (
            <ProgressBar
              className="mt-5"
              value={stats.totalPoints}
              max={scoreBarMax}
              label="Доля набранных баллов"
              tone={scoreTone}
            />
          ) : null}
        </div>

        <div className="mt-8 border-t border-border/60 pt-8">
          <h4 className="typo-h3">Текущий модуль</h4>
          <p className="typo-body mt-3 font-medium text-foreground">{stats.currentModuleTitle ?? "—"}</p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button variant="primary" className="w-full sm:w-auto" asChild>
              <Link href={continueHref}>Продолжить обучение</Link>
            </Button>
            <Button variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/dashboard/course">Все модули</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-primary/6 via-card to-cyan/5 p-6 shadow-(--shadow-card) ring-1 ring-primary/15 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-12 h-32 w-32 rounded-full bg-cyan/15 blur-2xl" aria-hidden />
        <div className="relative">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path d="M12 3v1M12 20v1M3 12h1M20 12h1" strokeLinecap="round" />
                <path d="m15 9-1.5 4.5L9 15l4.5 1.5L15 21l1.5-4.5L21 15l-4.5-1.5L15 9Z" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="typo-h3">AI-персонализация</h3>
              <p className="typo-body mt-3 font-medium">
                {interestsEmpty ? (
                  <span className="text-muted-foreground">Интересы пока не указаны.</span>
                ) : (
                  <span className="leading-relaxed">{interestsDisplay}</span>
                )}
              </p>
              <p className="typo-body-muted mt-3">
                AI использует ваши интересы, чтобы объяснять лекции понятнее.
              </p>
              <Button variant="outline" size="sm" className="mt-5 w-full border-primary/25 bg-card/80 hover:border-primary/40 sm:w-auto" asChild>
                <Link href="/dashboard/settings">{hasInterestsForAi ? "Изменить интересы" : "Указать интересы"}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className={cn(cardShell, "overflow-hidden")}>
        <ProfileAchievements rows={achievements} />
      </section>

      <section className={cardShell}>
        <h3 className="typo-h3">Сертификат</h3>
        <p className="typo-body-muted mt-1">
          Электронный документ о прохождении программы — после полного прохождения модулей.
        </p>
        <div className="mt-6">
          <CertificatePanel
            courseId={stats.courseId}
            courseCompleted={stats.allModulesComplete}
            certificate={certificatePayload}
            generateButtonText="Получить сертификат"
            downloadButtonText="Скачать сертификат"
          />
        </div>
      </section>
    </div>
  );
}
