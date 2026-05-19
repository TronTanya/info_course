"use client";

import { RouteErrorView } from "@/components/ui/route-error-view";

export default function ModuleTestError({
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
      logTag="test"
      title="Не удалось загрузить тест"
      description="Проверьте соединение и попробуйте снова. Если тест недоступен — сначала завершите лекцию модуля."
      homeHref="/dashboard/course"
      homeLabel="К карте курса"
    />
  );
}
