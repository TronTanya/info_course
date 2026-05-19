"use client";

import { RouteErrorView } from "@/components/ui/route-error-view";

export default function LessonError({
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
      logTag="lesson"
      title="Не удалось загрузить лекцию"
      description="Попробуйте обновить страницу. Если урок заблокирован — завершите предыдущий модуль в карте курса."
      homeHref="/dashboard/course"
      homeLabel="К карте курса"
    />
  );
}
