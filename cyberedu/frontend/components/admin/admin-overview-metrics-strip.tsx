import type { AdminLmsOverview } from "@/lib/admin-lms-dashboard";
import { MetricCard } from "@/components/ui/metric-card";
import { cn } from "@/lib/utils";

export function AdminOverviewMetricsStrip({
  overview,
  publishedReviewsCount,
  className,
}: {
  overview: AdminLmsOverview;
  publishedReviewsCount?: number;
  className?: string;
}) {
  const testAvg =
    overview.averageTestPercent != null ? `${overview.averageTestPercent}%` : "—";

  return (
    <section
      aria-labelledby="admin-overview-metrics-heading"
      className={cn("min-w-0", className)}
    >
      <h2 id="admin-overview-metrics-heading" className="sr-only">
        Дополнительные метрики курса
      </h2>
      <div className="grid min-w-0 grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 xl:grid-cols-5">
        <MetricCard
          label="Активны (30 дн.)"
          value={overview.activeStudents30d}
          hint="прогресс, тесты, практика"
          variant="cyan"
        />
        <MetricCard
          label="Курс завершили"
          value={overview.studentsCompletedCourse}
          hint="все активные модули"
        />
        <MetricCard label="Ср. балл тестов" value={testAvg} hint="по попыткам USER" />
        <MetricCard
          label="Практики сданы"
          value={overview.practicesCompleted}
          hint="practiceCompleted"
        />
        {publishedReviewsCount != null ? (
          <MetricCard
            label="Отзывы опубликованы"
            value={publishedReviewsCount}
            hint="isPublished"
            variant="accent"
          />
        ) : null}
      </div>
    </section>
  );
}
