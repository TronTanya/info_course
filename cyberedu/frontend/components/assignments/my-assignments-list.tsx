"use client";

import Link from "next/link";
import type { SubmissionStatus } from "@prisma/client";
import { motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type AssignmentListItem = {
  id: string;
  status: SubmissionStatus;
  score: number | null;
  updatedAt: string;
  taskTitle: string;
  moduleId: string;
  moduleTitle: string;
  moduleOrder: number;
};

function submissionStatusLabel(s: SubmissionStatus): string {
  const m: Record<SubmissionStatus, string> = {
    DRAFT: "Черновик",
    SUBMITTED: "Отправлено",
    CHECKING: "На проверке",
    ACCEPTED: "Принято",
    REJECTED: "Отклонено",
    NEEDS_REVISION: "На доработку",
  };
  return m[s] ?? s;
}

function statusBadgeVariant(
  s: SubmissionStatus,
): "default" | "secondary" | "success" | "warning" | "danger" | "cyan" | "outline" | "primary" {
  if (s === "ACCEPTED") return "success";
  if (s === "REJECTED") return "danger";
  if (s === "CHECKING" || s === "SUBMITTED") return "primary";
  if (s === "NEEDS_REVISION") return "warning";
  if (s === "DRAFT") return "secondary";
  return "outline";
}

export function MyAssignmentsList({ items }: { items: AssignmentListItem[] }) {
  const reduce = useReducedMotion();

  return (
    <ul className="space-y-3">
      {items.map((s, index) => {
        const href = `/dashboard/course/${s.moduleId}/practice`;
        return (
          <motion.li
            key={s.id}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card
              interactive
              className={cn(
                "ce-learn-panel ce-glass overflow-hidden shadow-sm ring-1 ring-primary/10",
                s.status === "NEEDS_REVISION" && "ring-warning/25",
                s.status === "ACCEPTED" && "ring-success/20",
              )}
            >
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Модуль {s.moduleOrder}: {s.moduleTitle}
                  </p>
                  <p className="mt-1 font-medium text-foreground">{s.taskTitle}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Обновлено{" "}
                    {new Date(s.updatedAt).toLocaleString("ru-RU", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                  <Badge variant={statusBadgeVariant(s.status)}>{submissionStatusLabel(s.status)}</Badge>
                  {typeof s.score === "number" ? (
                    <span className="text-sm tabular-nums text-muted-foreground">Баллы: {s.score}</span>
                  ) : null}
                  <Button variant="outline" size="sm" asChild>
                    <Link href={href}>К заданию</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.li>
        );
      })}
    </ul>
  );
}
