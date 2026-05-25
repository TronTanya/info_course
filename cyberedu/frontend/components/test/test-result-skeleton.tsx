import { Skeleton } from "@/components/ui/skeleton";
import { StateShell } from "@/components/ui/state-shell";

/** Skeleton экрана результата теста. */
export function TestResultSkeleton() {
  return (
    <StateShell variant="loading" terminalLine="assessment --result" className="overflow-hidden">
      <div className="space-y-6 p-5 sm:p-7" aria-busy="true" aria-label="Загрузка результата теста">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full space-y-2 sm:max-w-md">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-6 w-36 rounded-full" />
          </div>
          <Skeleton className="size-[120px] shrink-0 rounded-full" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    </StateShell>
  );
}
