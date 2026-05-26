import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function PageHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3 border-b border-border pb-6", className)} aria-busy="true" aria-label="Загрузка">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-2/3 max-w-md" />
      <Skeleton className="h-4 w-full max-w-xl" />
    </div>
  );
}

export function ProfilePageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6 sm:space-y-8", className)} aria-busy="true" aria-label="Загрузка профиля">
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-40 w-full rounded-2xl sm:h-44" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="min-h-56 rounded-2xl" />
        <Skeleton className="min-h-56 rounded-2xl" />
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("responsive-card-grid", className)} aria-busy="true" aria-label="Загрузка">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-4/5" />
          <Skeleton className="mt-6 h-9 w-28 rounded-xl" />
        </div>
      ))}
    </div>
  );
}
