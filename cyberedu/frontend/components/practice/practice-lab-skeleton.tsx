import { Skeleton } from "@/components/ui/skeleton";

/** Скелетон страницы практики: шапка, сценарий, артефакты, форма. */
export function PracticeLabSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6" aria-busy="true" aria-label="Загрузка лаборатории">
      <header className="space-y-3 rounded-2xl border border-border/60 p-4 sm:p-5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-2/3 max-w-lg" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </header>

      <section className="space-y-3 rounded-2xl border border-border/60 p-4 sm:p-5" aria-hidden>
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </section>

      <section className="space-y-3 rounded-2xl border border-border/60 p-4 sm:p-5" aria-hidden>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </section>

      <section className="space-y-3 rounded-2xl border border-border/60 p-4 sm:p-5" aria-hidden>
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-36 w-full rounded-xl" />
        <Skeleton className="h-11 w-full max-w-xs rounded-lg" />
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Skeleton className="hidden h-48 w-full rounded-xl lg:block" />
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
