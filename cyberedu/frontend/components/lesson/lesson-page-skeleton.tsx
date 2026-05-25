import { Skeleton } from "@/components/ui/skeleton";

export function LessonPageHeaderSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <Skeleton className="h-4 w-48 max-w-full rounded-md" />
      <Skeleton className="h-28 w-full rounded-2xl sm:h-32" />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-28 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function LessonPageContentSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[42rem] space-y-6" aria-hidden>
      <div className="space-y-2">
        <Skeleton className="h-3 w-32 rounded-md" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-28 rounded-md" />
        <Skeleton className="h-16 w-full rounded-2xl" />
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="min-h-[22rem] w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-16 w-full rounded-2xl" />
    </div>
  );
}

export function LessonPageSidebarSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="space-y-3 rounded-2xl border border-border/60 p-3">
        <Skeleton className="h-3 w-20 rounded-md" />
        <Skeleton className="h-36 w-full rounded-xl" />
        <Skeleton className="h-8 w-full rounded-lg" />
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
      <Skeleton className="min-h-[14rem] w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  );
}

/** Skeleton страницы урока: header, nav rail, content, mentor sidebar. */
export function LessonPageSkeleton() {
  return (
    <div
      className="ce-lesson-page-skeleton space-y-5 overflow-x-hidden"
      aria-busy="true"
      aria-label="Загрузка урока"
    >
      <LessonPageHeaderSkeleton />

      <div className="flex flex-wrap gap-2 lg:hidden" aria-hidden>
        <Skeleton className="h-11 min-w-[8rem] flex-1 rounded-xl" />
        <Skeleton className="h-11 min-w-[8rem] flex-1 rounded-xl" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(12rem,14rem)_minmax(0,1fr)_minmax(16rem,20rem)] lg:gap-8 xl:grid-cols-[14rem_minmax(0,42rem)_20rem] xl:justify-center">
        <aside className="hidden lg:block">
          <div className="space-y-4 rounded-2xl border border-border/60 p-3">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        </aside>

        <LessonPageContentSkeleton />

        <aside className="hidden lg:block">
          <LessonPageSidebarSkeleton />
        </aside>
      </div>
    </div>
  );
}
