import { CoursePathNav } from "@/components/course/course-path-nav";
import { Skeleton } from "@/components/ui/skeleton";

function TimelineModuleSkeleton({ alternate }: { alternate?: boolean }) {
  return (
    <div
      className={`grid min-w-0 grid-cols-[2.75rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-x-4 ${
        alternate ? "xl:grid-cols-[minmax(0,1fr)_3rem]" : ""
      }`}
    >
      <div className="flex flex-col items-center pt-2">
        <Skeleton className="size-11 rounded-2xl sm:size-12" />
        <Skeleton className="ce-roadmap-timeline-rail mt-2 w-0.5 flex-1 min-h-8 rounded-full" />
      </div>
      <Skeleton className="mb-6 min-h-48 rounded-2xl sm:mb-8" />
    </div>
  );
}

/** Полный skeleton страницы курса (header, summary, next step, roadmap, cards). */
export function CoursePageSkeleton() {
  return (
    <div className="ce-course-page-skeleton space-y-6 overflow-x-hidden sm:space-y-8 lg:space-y-10" aria-busy="true" aria-label="Загрузка курса">
      <CoursePathNav />

      <Skeleton className="h-[min(380px,48vh)] rounded-3xl" />

      <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <Skeleton className="min-h-36 min-[480px]:col-span-2 xl:col-span-2 rounded-2xl" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="min-h-28 rounded-2xl" />
        ))}
      </div>

      <Skeleton className="min-h-44 rounded-2xl" />

      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        <div className="space-y-6">
          <TimelineModuleSkeleton />
          <TimelineModuleSkeleton alternate />
          <TimelineModuleSkeleton />
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="min-h-72 rounded-2xl" />
          ))}
        </div>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-2 lg:gap-6">
        <Skeleton className="min-h-56 rounded-2xl" />
        <Skeleton className="min-h-56 rounded-2xl" />
      </div>
    </div>
  );
}
