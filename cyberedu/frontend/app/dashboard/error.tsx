"use client";

import { RouteErrorView } from "@/components/ui/route-error-view";

export default function DashboardError({
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
      logTag="dashboard"
      title="Не удалось загрузить кабинет"
      description="Похоже, произошла временная ошибка. Проверьте соединение и попробуйте снова."
      homeHref="/"
      homeLabel="На главную"
      className="max-w-lg"
    />
  );
}
