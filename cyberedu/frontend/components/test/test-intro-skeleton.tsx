import { Skeleton } from "@/components/ui/skeleton";
import { StateShell } from "@/components/ui/state-shell";

/** Skeleton экрана перед тестом (intro). */
export function TestIntroSkeleton() {
  return (
    <StateShell variant="loading" terminalLine="assessment --intro" className="overflow-hidden">
      <div className="space-y-6 p-5 sm:p-7" aria-busy="true" aria-label="Загрузка описания теста">
        <div className="space-y-2">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-8 w-3/4 max-w-lg" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-12 w-44 rounded-xl" />
      </div>
    </StateShell>
  );
}
