import { Skeleton } from "@/components/ui/skeleton";
import { StateShell } from "@/components/ui/state-shell";

/** Skeleton загрузки экрана теста. */
export function TestTakingSkeleton() {
  return (
    <StateShell variant="loading" terminalLine="assessment --load" className="overflow-hidden">
      <div className="space-y-6 p-5 sm:p-6" aria-busy="true" aria-label="Загрузка теста">
        <div className="space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-6 w-3/4 max-w-lg" />
        <div className="space-y-3">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-4/5 rounded-xl" />
        </div>
        <div className="flex flex-col gap-2 border-t border-border/50 pt-5 sm:flex-row sm:justify-between">
          <Skeleton className="h-12 w-full rounded-2xl sm:w-28" />
          <Skeleton className="h-12 w-full rounded-2xl sm:w-36" />
        </div>
      </div>
    </StateShell>
  );
}
