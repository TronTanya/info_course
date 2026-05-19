"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";

export default function LessonError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[lesson]", error);
  }, [error]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4 py-12">
      <ErrorState
        className="max-w-lg"
        server
        code={error.digest}
        title="Не удалось загрузить лекцию"
        description="Попробуйте обновить страницу. Если урок заблокирован — вернитесь к карте курса и завершите предыдущий модуль."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button type="button" variant="primary" onClick={() => reset()}>
              Попробовать снова
            </Button>
            <Button type="button" variant="outline" onClick={() => (window.location.href = "/dashboard/course")}>
              К карте курса
            </Button>
          </div>
        }
      />
    </div>
  );
}
