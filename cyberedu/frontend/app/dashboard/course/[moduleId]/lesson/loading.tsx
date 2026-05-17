import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function LessonLoading() {
  return (
    <DashboardShell wide>
      <div className="space-y-5 overflow-x-hidden" aria-busy="true" aria-label="Загрузка лекции">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-10 w-40 rounded-xl lg:hidden" />
        <div className="grid gap-6 lg:grid-cols-[14rem_1fr] xl:grid-cols-[14rem_minmax(0,42rem)_1fr]">
          <Skeleton className="hidden h-80 rounded-2xl lg:block" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-[28rem] w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
          <Skeleton className="hidden h-64 rounded-2xl xl:block" />
        </div>
      </div>
    </DashboardShell>
  );
}
