"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { ErrorCard } from "@/components/ui/error-card";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  return (
    <AdminShell>
      <div className="flex min-h-[50vh] items-center justify-center px-4 py-12">
        <ErrorCard
          className="max-w-lg"
          server
          title="Ошибка в админ-панели"
          description="Не удалось загрузить раздел. Попробуйте снова или вернитесь к списку."
          code={error.digest}
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button type="button" variant="primary" onClick={() => reset()}>
                Попробовать снова
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin">К обзору</Link>
              </Button>
            </div>
          }
        />
      </div>
    </AdminShell>
  );
}
