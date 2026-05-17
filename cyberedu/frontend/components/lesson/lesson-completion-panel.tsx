"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";

export function LessonCompletionPanel({
  lessonCompleted,
  markPending,
  onMarkStudied,
  testHref,
  moduleHref,
  error,
}: {
  lessonCompleted: boolean;
  markPending: boolean;
  onMarkStudied: () => void;
  testHref: string;
  moduleHref: string;
  error: string | null;
}) {
  const reduce = useReducedMotion();

  return (
    <GlassCard glow className="overflow-hidden p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 gap-4">
          {lessonCompleted ? (
            <motion.span
              className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-success/35 bg-success/12 text-success"
              key={lessonCompleted ? "done" : "pending"}
              initial={reduce ? false : { scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
            >
              <CheckCircle2 className="size-7" strokeWidth={1.75} aria-hidden />
            </motion.span>
          ) : (
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted/40 text-muted-foreground">
              <span className="size-3 rounded-full bg-primary/60" aria-hidden />
            </span>
          )}
          <div className="min-w-0 space-y-1">
            <p className="typo-eyebrow text-primary">Завершение лекции</p>
            {lessonCompleted ? (
              <>
                <h2 className="font-display text-lg font-semibold text-foreground">Лекция пройдена</h2>
                <p className="text-sm text-muted-foreground">Отлично! Следующий шаг — контрольный тест по модулю.</p>
                <Badge variant="success" className="mt-1 w-fit">
                  Изучено
                </Badge>
              </>
            ) : (
              <>
                <h2 className="font-display text-lg font-semibold text-foreground">Отметьте прогресс</h2>
                <p className="text-sm text-muted-foreground">
                  Когда закончите чтение, нажмите кнопку — откроется доступ к тесту.
                </p>
              </>
            )}
            {error ? <p className="text-sm text-danger">{error}</p> : null}
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[200px]">
          {!lessonCompleted ? (
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full"
              loading={markPending}
              disabled={markPending}
              onClick={onMarkStudied}
            >
              Отметить как пройдено
            </Button>
          ) : (
            <Button variant="primary" size="lg" className="w-full" asChild>
              <Link href={testHref}>
                Перейти к тесту
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href={moduleHref}>К обзору модуля</Link>
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}
