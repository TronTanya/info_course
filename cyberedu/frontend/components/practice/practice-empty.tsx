import { PracticePageEmptyState } from "@/components/practice/practice-page-states";

/** @deprecated Используйте PracticePageEmptyState на сервере; обёртка для совместимости. */
export function PracticeEmpty({ moduleId }: { moduleId: string }) {
  return (
    <PracticePageEmptyState kind="practice_not_found" moduleId={moduleId} />
  );
}
