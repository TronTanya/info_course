"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ErrorCard } from "@/components/ui/error-card";
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
      <ErrorCard
        className="max-w-lg"
        server
        title="Не удалось загрузить кабинет"
        description="Похоже, произошла временная ошибка. Проверьте соединение и попробуйте снова. Если проблема повторяется — обновите страницу позже."
        code={error.digest}
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
