"use client";

import { RouteErrorView } from "@/components/ui/route-error-view";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** error.tsx страницы курса — без stack trace в UI, безопасный лог. */
export function CourseRouteError({ error, reset }: Props) {
  return (
    <RouteErrorView
      error={error}
      reset={reset}
      logTag="course"
      structuredLog
      title="Не удалось загрузить карту курса"
      description="Попробуйте обновить страницу. Если ошибка повторяется — вернитесь в кабинет."
      homeHref="/dashboard"
      homeLabel="Вернуться в кабинет"
      retryLabel="Повторить попытку"
    />
  );
}
