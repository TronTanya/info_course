import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import type { ProfileCourseStats, ProfileRecentTest } from "@/lib/profile-course-stats";
import type { DashboardWeakTopic } from "@/lib/dashboard-ui";
import { ProfileListPager } from "@/components/profile/profile-list-pager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionCard } from "@/components/ui/section-card";

function formatAt(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

export function ProfileTestResults({
  stats,
  recentTests,
  weakTopics,
}: {
  stats: ProfileCourseStats;
  recentTests: ProfileRecentTest[];
  weakTopics: DashboardWeakTopic[];
}) {
  return (
    <SectionCard variant="default" flushTitle className="p-4 sm:p-6" aria-labelledby="profile-tests-heading">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ClipboardCheck className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 id="profile-tests-heading" className="font-display text-base font-semibold text-foreground sm:text-lg">
            Результаты тестов
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Последние попытки и темы для повторения.</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <MetricCard
          label="Средний балл"
          value={stats.averageTestPercent != null ? `${stats.averageTestPercent}%` : "—"}
          hint={stats.testAttemptCount > 0 ? `${stats.testAttemptCount} попыток` : "Попыток пока нет"}
        />
        <MetricCard
          label="Зачёты"
          value={stats.testsPassedCount > 0 ? String(stats.testsPassedCount) : "—"}
          hint={stats.testAttemptCount > 0 ? `из ${stats.testAttemptCount} попыток` : "Сдайте первый тест"}
        />
      </div>

      {recentTests.length === 0 ? (
        <EmptyState
          className="mt-4 py-8"
          title="Тестов пока нет"
          description="Пройдите тест в текущем модуле — результат появится здесь."
          action={
            stats.currentModuleId ? (
              <Button asChild variant="primary" size="sm">
                <Link href={`/dashboard/course/${stats.currentModuleId}/test`}>К тесту модуля</Link>
              </Button>
            ) : (
              <Button asChild variant="primary" size="sm">
                <Link href="/dashboard/course">К карте курса</Link>
              </Button>
            )
          }
        />
      ) : (
        <ProfileListPager
          className="mt-4"
          items={recentTests}
          renderItem={(t) => (
            <li key={`${t.moduleId}-${t.at}`}>
              <Link
                href={`/dashboard/course/${t.moduleId}/test`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-muted/15 px-3 py-2.5 transition-colors hover:border-primary/25 hover:bg-primary/5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{t.testTitle}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.moduleTitle}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={t.passed ? "success" : "danger"}>{t.passed ? "Зачёт" : "Не зачтён"}</Badge>
                  <span className="text-sm font-semibold tabular-nums text-foreground">{t.percent}%</span>
                  <span className="text-2.5 text-muted-foreground">{formatAt(t.at)}</span>
                </div>
              </Link>
            </li>
          )}
        />
      )}

      {weakTopics.length > 0 ? (
        <div className="mt-5 border-t border-border/60 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-warning">Темы для повторения</p>
          <ul className="mt-2 space-y-2">
            {weakTopics.map((w) => (
              <li key={w.id}>
                <Link href={w.href} className="block text-sm text-foreground hover:text-primary">
                  <span className="font-medium">{w.title}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{w.reason}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </SectionCard>
  );
}
