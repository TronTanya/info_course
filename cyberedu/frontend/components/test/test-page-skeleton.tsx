import { PageHeaderSkeleton } from "@/components/ui/page-skeleton";
import { TestIntroSkeleton } from "@/components/test/test-intro-skeleton";

/** Полная skeleton-страница теста (маршрут loading.tsx). */
export function TestPageSkeleton() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton />
      <TestIntroSkeleton />
    </div>
  );
}
