"use client";

import { Clock, AlertTriangle } from "lucide-react";
import type { TestTakingDisplayTimer } from "@/lib/hooks/use-test-taking-display-timer";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

export function TestTakingTimer({
  timer,
  timeExpiredNotice,
  className,
}: {
  timer: TestTakingDisplayTimer;
  /** Родитель показал, что сработал onExpire (открыт submit). */
  timeExpiredNotice?: boolean;
  className?: string;
}) {
  if (!timer.label && !timeExpiredNotice) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {timer.label ? (
        <div
          className={cn(
            "ce-glass flex min-w-0 flex-col gap-2 rounded-xl border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4",
            timer.isCritical && "border-danger/40 bg-danger/10",
            timer.isLow && !timer.isCritical && "border-warning/35 bg-warning/8",
            !timer.isLow && !timer.isCritical && "border-border/70 bg-muted/15",
          )}
          role="group"
          aria-label="Оставшееся время (ориентир, не влияет на зачёт автоматически)"
        >
          <div className="flex items-center gap-2">
            <Clock
              className={cn(
                "size-4 shrink-0",
                timer.isCritical ? "text-danger" : timer.isLow ? "text-warning" : "text-primary",
              )}
              aria-hidden
            />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Осталось времени
              </p>
              <p
                className={cn(
                  "font-mono text-lg font-semibold tabular-nums",
                  timer.isCritical ? "text-danger" : timer.isLow ? "text-warning" : "text-foreground",
                )}
                aria-live="off"
              >
                {timer.label}
                {timer.isCritical ? (
                  <span className="sr-only">. Мало времени</span>
                ) : timer.isLow ? (
                  <span className="sr-only">. Скоро закончится</span>
                ) : null}
              </p>
            </div>
          </div>
          <p className="min-w-0 text-xs text-pretty text-muted-foreground sm:max-w-[14rem] sm:shrink-0">
            Таймер для ориентира. Зачёт определяется при отправке на сервер.
          </p>
        </div>
      ) : null}
      {timer.remainingPct != null && timer.label ? (
        <ProgressBar
          label="Время"
          value={timer.remainingPct}
          max={100}
          tone={timer.isCritical ? "danger" : timer.isLow ? "warning" : "default"}
        />
      ) : null}
      {timeExpiredNotice || timer.expired ? (
        <p
          className="flex items-start gap-2 rounded-lg border border-danger/35 bg-danger/10 px-3 py-2 text-sm text-danger"
          role="alert"
          aria-live="assertive"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            Время истекло. Отправьте тест на проверку — ответы примутся только после подтверждения на сервере.
          </span>
        </p>
      ) : null}
      {timer.isLow && !timer.expired && !timeExpiredNotice ? (
        <p className="text-xs text-warning" role="status" aria-live="polite">
          <span aria-hidden>⚠ </span>
          Осталось мало времени — проверьте неотвеченные вопросы в навигации ниже.
        </p>
      ) : null}
    </div>
  );
}
