import { Skeleton } from "@/components/ui/skeleton";
import { StateShell } from "@/components/ui/state-shell";

/** Skeleton одного вопроса во время прохождения. */
export function TestQuestionSkeleton() {
  return (
    <StateShell variant="loading" terminalLine="assessment --question" className="overflow-hidden">
      <div className="space-y-0" aria-busy="true" aria-label="Загрузка вопроса">
        <div className="space-y-3 border-b border-border/60 px-4 py-4 sm:px-6">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-2 w-3/4 rounded-full" />
        </div>
        <div className="space-y-6 px-4 py-6 sm:px-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full max-w-2xl" />
          <ul className="space-y-3">
            {Array.from({ length: 4 }, (_, i) => (
              <li key={i}>
                <Skeleton className="h-14 w-full rounded-xl" />
              </li>
            ))}
          </ul>
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-12 w-28 rounded-xl" />
            <Skeleton className="h-12 w-28 rounded-xl" />
          </div>
        </div>
      </div>
    </StateShell>
  );
}
