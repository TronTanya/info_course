import { Skeleton } from "@/components/ui/skeleton";

export function PracticeLabSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6" aria-busy="true" aria-label="Загрузка лаборатории">
      <Skeleton className="h-8 w-2/3 max-w-md" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4 rounded-2xl border border-border/60 p-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
