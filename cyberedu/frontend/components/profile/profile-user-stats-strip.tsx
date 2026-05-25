import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import { MetricCard } from "@/components/ui/metric-card";

export function ProfileUserStatsStrip({
  stats,
  achievementsUnlocked,
  achievementsTotal,
}: {
  stats: ProfileCourseStats;
  achievementsUnlocked: number;
  achievementsTotal: number;
}) {
  return (
    <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
      <MetricCard label="Курс" value={`${stats.progressPercent}%`} hint={`${stats.completedModules}/${stats.totalModules} мод.`} />
      <MetricCard
        label="Тесты"
        value={stats.averageTestPercent != null ? `${stats.averageTestPercent}%` : "—"}
        hint={
          stats.testAttemptCount > 0
            ? `средний · ${stats.testsPassedCount} зачётов`
            : "попыток пока нет"
        }
      />
      <MetricCard
        label="Практика"
        value={stats.practicesTotal > 0 ? `${stats.practicesCompleted}/${stats.practicesTotal}` : "—"}
        hint="модулей с зачётом"
      />
      <MetricCard
        label="Достижения"
        value={achievementsTotal > 0 ? `${achievementsUnlocked}/${achievementsTotal}` : "—"}
        hint="открыто бейджей"
      />
    </div>
  );
}
