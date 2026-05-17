"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard]", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 py-12">
      <ErrorState
        className="max-w-lg"
        title="Не удалось загрузить кабинет"
        description="Похоже, произошла временная ошибка. Проверьте соединение и попробуйте снова. Если проблема повторяется — обновите страницу позже."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button type="button" variant="primary" onClick={() => reset()}>
              Попробовать снова
            </Button>
            <Button asChild variant="outline">
              <Link href="/">На главную</Link>
            </Button>
          </div>
        }
      />
    </div>
  );
}
