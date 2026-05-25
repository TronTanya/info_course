import { CoursePathNav } from "@/components/course/course-path-nav";
import { Skeleton } from "@/components/ui/skeleton";

export function CoursePageTopSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8" aria-busy="true" aria-label="Загрузка шапки курса">
      <CoursePathNav />
      <Skeleton className="h-[min(420px,52vh)] rounded-3xl" />
      <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <Skeleton className="min-h-36 min-[480px]:col-span-2 xl:col-span-2 rounded-2xl" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="min-h-28 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
