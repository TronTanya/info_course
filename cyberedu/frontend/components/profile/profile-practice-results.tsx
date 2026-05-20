import Link from "next/link";
import { FlaskConical } from "lucide-react";
import type { ProfileCourseStats, ProfileRecentSubmission } from "@/lib/profile-course-stats";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionCard } from "@/components/ui/section-card";

function formatAt(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

const outcomeBadge: Record<
  ProfileRecentSubmission["outcome"],
  { label: string; variant: "success" | "danger" | "secondary" }
> = {
  passed: { label: "Passed", variant: "success" },
  needs_improvement: { label: "Needs improvement", variant: "danger" },
  pending: { label: "На проверке", variant: "secondary" },
};

export function ProfilePracticeResults({
  stats,
  recentSubmissions,
}: {
  stats: ProfileCourseStats;
  recentSubmissions: ProfileRecentSubmission[];
}) {
  const passedCount = recentSubmissions.filter((s) => s.outcome === "passed").length;

  return (
    <SectionCard variant="default" flushTitle className="p-4 sm:p-6" aria-labelledby="profile-practice-heading">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-cyan/10 text-cyan">
          <FlaskConical className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 id="profile-practice-heading" className="font-display text-base font-semibold text-foreground sm:text-lg">
            Практические задания
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Статусы сдач и последние submissions.</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <MetricCard
          label="Модули с практикой"
          value={stats.practicesTotal > 0 ? `${stats.practicesCompleted}/${stats.practicesTotal}` : "—"}
          hint="зачтённая практика по модулю"
        />
        <MetricCard
          label="Принято (последние)"
          value={recentSubmissions.length > 0 ? `${passedCount}/${recentSubmissions.length}` : "—"}
          hint="по последним 5 отправкам"
        />
      </div>

      {recentSubmissions.length === 0 ? (
        <EmptyState
          className="mt-4 py-8"
          title="Практик пока нет"
          description="Отправьте решение в лаборатории модуля — статус появится в портфолио."
          action={
            stats.currentModuleId ? (
              <Button asChild variant="primary" size="sm">
                <Link href={`/dashboard/course/${stats.currentModuleId}/practice`}>К практике</Link>
              </Button>
            ) : (
              <Button asChild variant="primary" size="sm">
                <Link href="/dashboard/course">К карте курса</Link>
              </Button>
            )
          }
        />
      ) : (
        <ul className="mt-4 space-y-2">
          {recentSubmissions.map((s) => {
            const badge = outcomeBadge[s.outcome];
            return (
              <li key={`${s.moduleId}-${s.at}`}>
                <Link
                  href={`/dashboard/course/${s.moduleId}/practice`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-muted/15 px-3 py-2.5 transition-colors hover:border-cyan/25 hover:bg-cyan/5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{s.taskTitle}</p>
                    <p className="truncate text-xs text-muted-foreground">{s.moduleTitle}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    <span className="text-xs text-muted-foreground">{s.statusLabel}</span>
                    <span className="text-[10px] text-muted-foreground">{formatAt(s.at)}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
