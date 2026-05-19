"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ErrorCard } from "@/components/ui/error-card";
import { Button } from "@/components/ui/button";

export type RouteErrorViewProps = {
  error: Error & { digest?: string };
  reset: () => void;
  /** Метка в console.error, например `lesson` */
  logTag: string;
  title: string;
  description: string;
  homeHref?: string;
  homeLabel?: string;
  className?: string;
};

/** Единый экран ошибки сегмента маршрута (error.tsx). */
export function RouteErrorView({
  error,
  reset,
  logTag,
  title,
  description,
  homeHref = "/dashboard",
  homeLabel = "В кабинет",
  className,
}: RouteErrorViewProps) {
  useEffect(() => {
    console.error(`[${logTag}]`, error);
  }, [error, logTag]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4 py-12">
      <ErrorCard
        className={className ?? "max-w-lg w-full"}
        server
        title={title}
        description={description}
        code={error.digest}
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button type="button" variant="primary" onClick={() => reset()}>
              Попробовать снова
            </Button>
            <Button asChild variant="outline">
              <Link href={homeHref}>{homeLabel}</Link>
            </Button>
          </div>
        }
      />
    </div>
  );
}
