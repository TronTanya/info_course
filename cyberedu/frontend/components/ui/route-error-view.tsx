"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ErrorCard } from "@/components/ui/error-card";
import { Button } from "@/components/ui/button";
import { logError } from "@/lib/log/structured";

export type RouteErrorViewProps = {
  error: Error & { digest?: string };
  reset: () => void;
  /** Метка в логе, например `lesson` */
  logTag: string;
  /** Структурированный JSON-лог вместо console.error (без stack trace в UI). */
  structuredLog?: boolean;
  title: string;
  description: string;
  homeHref?: string;
  homeLabel?: string;
  retryLabel?: string;
  className?: string;
};

/** Единый экран ошибки сегмента маршрута (error.tsx). */
export function RouteErrorView({
  error,
  reset,
  logTag,
  structuredLog = false,
  title,
  description,
  homeHref = "/dashboard",
  homeLabel = "В кабинет",
  retryLabel = "Попробовать снова",
  className,
}: RouteErrorViewProps) {
  useEffect(() => {
    if (structuredLog) {
      logError(`route_error_${logTag}`, {
        digest: error.digest,
        code: error.message?.slice(0, 120),
      });
      return;
    }
    console.error(`[${logTag}]`, error);
  }, [error, logTag, structuredLog]);

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
              {retryLabel}
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
