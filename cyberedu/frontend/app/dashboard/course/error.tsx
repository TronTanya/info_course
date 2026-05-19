"use client";

import { RouteErrorView } from "@/components/ui/route-error-view";

export default function CourseError({
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
      logTag="course"
      title="Не удалось загрузить карту курса"
      description="Попробуйте обновить страницу. Если ошибка повторяется — вернитесь в кабинет и откройте курс снова."
      homeHref="/dashboard"
      homeLabel="В кабинет"
    />
  );
}
