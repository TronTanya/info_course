import type { AchievementRow } from "@/lib/achievements";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import { buildProfileQuickActions, buildProfileWeakTopics } from "@/lib/profile-ui";
import { buildRecentActivities, computeStepMetrics } from "@/lib/dashboard-ui";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { ProfileAchievementsPanel } from "@/components/achievements/profile-achievements-panel";
import { DashboardRecentActivity } from "@/components/dashboard/dashboard-recent-activity";
import { ProfileCertificateProgress } from "@/components/profile/profile-certificate-progress";
import { ProfileCompletedModules } from "@/components/profile/profile-completed-modules";
import { ProfileQuickActions } from "@/components/profile/profile-quick-actions";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/ui/metric-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ProgressRing } from "@/components/ui/progress-ring";
import { SectionCard } from "@/components/ui/section-card";
import { BookOpen, ClipboardCheck, FlaskConical } from "lucide-react";

export type ProfileProgressOverviewProps = {
  stats: ProfileCourseStats;
  achievements: AchievementRow[];
  modules: CourseProgressModuleRow[];
  interestsDisplay: string;
  hasInterestsForAi: boolean;
};

export function ProfileProgressOverview({
  stats,
  achievements,
  modules,
  interestsDisplay,
  hasInterestsForAi,
}: ProfileProgressOverviewProps) {
  const weakTopics = buildProfileWeakTopics(stats, modules);
  const quickActions = buildProfileQuickActions(stats, modules, weakTopics);
  const activities = buildRecentActivities(stats);
  const steps = computeStepMetrics(modules);
  const progressTone = stats.progressPercent >= 100 ? "success" : "default";
  const scoreTone =
    stats.maxPossiblePoints <= 0
      ? "default"
      : stats.scoreSuccessPercent >= 70
        ? "success"
        : stats.scoreSuccessPercent >= 40
          ? "warning"
          : "default";

  return (
    <div className="space-y-5 sm:space-y-6">
      <ProfileQuickActions actions={quickActions} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <SectionCard variant="lab" flushTitle className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="typo-eyebrow text-primary">Образовательный прогресс</p>
              <h2 className="mt-1 font-display text-lg font-semibold text-foreground sm:text-xl">{stats.courseTitle}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Завершено {stats.completedModules} из {stats.totalModules} модулей · {stats.totalPoints} баллов
                {stats.maxPossiblePoints > 0 ? ` из ${stats.maxPossiblePoints}` : ""}
              </p>
            </div>
            <Badge variant={stats.allModulesComplete ? "success" : "secondary"} className="shrink-0">
              {stats.allModulesComplete ? "Курс пройден" : `${stats.progressPercent}%`}
            </Badge>
          </div>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
            <ProgressRing
              value={stats.progressPercent}
              size={112}
              strokeWidth={9}
              tone={progressTone}
              label="Общий прогресс курса"
            />
            <div className="min-w-0 flex-1 space-y-4">
              <ProgressBar
                label="Прогресс по модулям"
                value={stats.progressPercent}
                max={100}
                tone={progressTone}
              />
              {stats.maxPossiblePoints > 0 ? (
                <ProgressBar
                  label="Набранные баллы"
                  value={stats.totalPoints}
                  max={stats.maxPossiblePoints}
                  tone={scoreTone}
                />
              ) : null}
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-2 border-t border-border/60 pt-5">
            <StepChip icon={BookOpen} done={steps.lessonsDone} total={steps.lessonsTotal} label="Лекции" />
            <StepChip icon={ClipboardCheck} done={steps.testsDone} total={steps.testsTotal} label="Тесты" />
            <StepChip icon={FlaskConical} done={steps.practiceDone} total={steps.practiceTotal} label="Практика" />
          </dl>
        </SectionCard>

        <SectionCard variant="default" flushTitle className="p-5 sm:p-6">
          <h2 className="font-display text-base font-semibold text-foreground">Аналитика</h2>
          <p className="mt-1 text-sm text-muted-foreground">Сводка по проверкам и баллам.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <MetricCard
              label="Средний результат тестов"
              value={stats.averageTestPercent != null ? `${stats.averageTestPercent}%` : "—"}
              hint={
                stats.testAttemptCount > 0
                  ? `${stats.testAttemptCount} попыток · ${stats.testsPassedCount} зачётов`
                  : "Сдайте первый тест"
              }
            />
            <MetricCard
              label="Выполненные практики"
              value={stats.practicesTotal > 0 ? String(stats.practicesCompleted) : "—"}
              hint={stats.practicesTotal > 0 ? `из ${stats.practicesTotal} модулей с практикой` : "нет заданий"}
            />
            <MetricCard label="Успешность баллов" value={stats.maxPossiblePoints > 0 ? `${stats.scoreSuccessPercent}%` : "—"} />
            <MetricCard
              label="Текущий модуль"
              value={stats.currentModuleTitle ? "В работе" : "—"}
              hint={stats.currentModuleTitle ?? "Все модули завершены"}
            />
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ProfileCompletedModules modules={stats.completedModuleRows} />
        <SectionCard variant="default" flushTitle className="p-4 sm:p-6">
          <DashboardRecentActivity items={activities} showProfileLink={false} />
        </SectionCard>
      </div>

      <ProfileCertificateProgress stats={stats} />

      <SectionCard variant="default" flushTitle className="overflow-hidden" id="achievements">
        <ProfileAchievementsPanel rows={achievements} />
      </SectionCard>

      <SectionCard variant="muted" flushTitle className="p-4 sm:p-6">
        <h2 className="font-display text-base font-semibold text-foreground">AI-персонализация</h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground/90">
          {hasInterestsForAi && interestsDisplay.trim().length > 0 ? (
            interestsDisplay
          ) : (
            <span className="text-muted-foreground">Интересы не указаны — настройте в параметрах профиля.</span>
          )}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Используются только для адаптации объяснений в лекциях; другим студентам не показываются.
        </p>
      </SectionCard>
    </div>
  );
}

function StepChip({
  icon: Icon,
  done,
  total,
  label,
}: {
  icon: typeof BookOpen;
  done: number;
  total: number;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 px-2 py-2.5 text-center">
      <Icon className="mx-auto size-4 text-primary" aria-hidden />
      <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">{total > 0 ? `${done}/${total}` : "—"}</p>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
