import {
  DashboardCardSkeleton,
  DashboardProgressSkeleton,
  DashboardWelcomeSkeleton,
} from "@/components/dashboard/dashboard-page-states";

/** Скелетон кабинета: сетка как у DashboardHome (основная колонка + сайдбар). */
export function DashboardHomeSkeleton() {
  return (
    <div
      className="ce-dashboard-cockpit min-w-0 overflow-x-clip pb-2"
      aria-busy="true"
      aria-label="Загрузка кабинета"
    >
      <div className="ce-dashboard-cockpit__layout flex flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(16.5rem,20rem)] lg:items-start lg:gap-4">
        <div className="flex min-w-0 flex-col gap-3">
          <DashboardWelcomeSkeleton />
          <DashboardProgressSkeleton />
          <DashboardCardSkeleton tall />
          <DashboardCardSkeleton />
        </div>

        <aside aria-hidden className="flex min-w-0 flex-col gap-3">
          <DashboardCardSkeleton />
          <DashboardCardSkeleton tall />
        </aside>
      </div>
    </div>
  );
}
