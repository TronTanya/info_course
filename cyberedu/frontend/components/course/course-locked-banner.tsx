"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ce-course-locked-banner-dismissed";

export function CourseLockedBanner({
  continueHref,
  continueLabel,
  className,
}: {
  continueHref?: string;
  continueLabel?: string;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
      setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function dismiss() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-warning/35 bg-warning/8 px-4 py-4 pr-12 sm:px-5",
        className,
      )}
      role="status"
    >
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        aria-label="Закрыть подсказку"
      >
        <X className="size-4" aria-hidden />
      </button>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
        <AlertTriangle className="size-5 shrink-0 text-warning" aria-hidden />
        <div className="min-w-0 space-y-2">
          <p className="font-semibold text-foreground">Модуль пока закрыт</p>
          <p className="text-sm text-pretty text-muted-foreground">
            Курс проходится по порядку: завершите урок, тест и практику предыдущего модуля — следующий откроется
            автоматически.
          </p>
          {continueHref && continueLabel ? (
            <Button asChild size="sm" variant="outline" className="mt-1 rounded-xl border-warning/30">
              <Link href={continueHref}>{continueLabel}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
