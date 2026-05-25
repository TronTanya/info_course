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
      structuredLog
      title="Не удалось загрузить урок"
      description="Произошла непредвиденная ошибка. Обновите страницу или вернитесь к карте курса."
      homeHref="/dashboard/course"
      homeLabel="Вернуться к курсу"
      retryLabel="Повторить попытку"
    />
  );
}
