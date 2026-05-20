import { Skeleton } from "@/components/ui/skeleton";
import { StateShell } from "@/components/ui/state-shell";

/** Skeleton загрузки экрана теста (intro + прогресс). */
export function TestTakingSkeleton() {
  return (
    <StateShell variant="loading" terminalLine="assessment --load" className="overflow-hidden">
      <div className="space-y-6 p-5 sm:p-7" aria-busy="true" aria-label="Загрузка теста">
        <div className="space-y-3">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-2/3 max-w-md" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-12 w-40 rounded-2xl" />
      </div>
    </StateShell>
  );
}
