"use client";

import { RouteErrorView } from "@/components/ui/route-error-view";

export default function ModulePracticeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorView
      error={error}
      reset={reset}
      logTag="practice"
      title="Не удалось загрузить практику"
      description="Попробуйте обновить страницу. Лаборатория открывается после лекции и теста модуля."
      homeHref="/dashboard/course"
      homeLabel="К карте курса"
    />
  );
}
