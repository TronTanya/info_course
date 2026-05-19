"use client";

import { RouteErrorView } from "@/components/ui/route-error-view";

export default function ModuleError({
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
      logTag="module"
      title="Не удалось загрузить модуль"
      description="Попробуйте обновить страницу. Если модуль закрыт — завершите предыдущий шаг в карте курса."
      homeHref="/dashboard/course"
      homeLabel="К карте курса"
    />
  );
}
