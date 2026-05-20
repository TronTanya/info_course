import Link from "next/link";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import { getCoursePositionLabel } from "@/lib/dashboard-ui";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

export function DashboardCockpitHeader({
  displayName,
  stats,
  modules,
}: {
  displayName: string;
  stats: ProfileCourseStats;
  modules: CourseProgressModuleRow[];
}) {
  const position = getCoursePositionLabel(stats, modules);

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-2">
        <p className="typo-eyebrow text-primary">Learning cockpit</p>
        <h1 className="font-display text-2xl font-semibold text-balance text-foreground sm:text-3xl">
          Здравствуйте, {displayName}
        </h1>
        <p className="break-words text-sm text-pretty text-muted-foreground sm:text-base">
          <span className="font-medium text-foreground">{stats.courseTitle}</span>
          <span aria-hidden> · </span>
          {position}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {stats.allModulesComplete ? (
          <StatusBadge status="completed" label="Курс завершён" />
        ) : (
          <StatusBadge status="in_progress" label={`${stats.progressPercent}% программы`} />
        )}
        <Button asChild size="sm" variant="outline" className="min-h-10">
          <Link href="/dashboard/course">Карта курса</Link>
        </Button>
      </div>
    </header>
  );
}
