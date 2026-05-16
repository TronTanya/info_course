import type { Metadata } from "next";
import Link from "next/link";
import type { SubmissionStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Мои задания",
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
  if (s === "CHECKING" || s === "SUBMITTED") return "cyan";
  if (s === "NEEDS_REVISION") return "warning";
  if (s === "DRAFT") return "secondary";
  return "outline";
}

export default async function MyAssignmentsPage() {
  const user = await getCurrentUser();
  if (!user?.profile) {
    redirect("/auth/login");
  }

  const submissions = await prisma.submission.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      practicalTask: {
        select: {
          title: true,
          module: { select: { id: true, title: true, orderNumber: true } },
        },
      },
    },
  });

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Мои задания</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Практические работы по курсу: статус проверки и быстрый переход к заданию.
          </p>
        </div>

        {submissions.length === 0 ? (
          <EmptyState
            title="Пока нет отправок"
            description="Когда вы начнёте или отправите практику в модулях курса, они появятся в этом списке."
            icon={
              <svg className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path d="M9 12h6M9 16h6M7 4h10a2 2 0 0 1 2 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 0 1 2-2Z" strokeLinejoin="round" />
              </svg>
            }
            action={
              <Button variant="primary" asChild>
                <Link href="/dashboard/course">Перейти к курсу</Link>
              </Button>
            }
          />
        ) : (
          <ul className="space-y-3">
            {submissions.map((s) => {
              const mod = s.practicalTask.module;
              const href = `/dashboard/course/${mod.id}/practice`;
              return (
                <li key={s.id}>
                  <Card className="overflow-hidden border-border/70 shadow-sm ring-1 ring-secondary/10 transition-shadow hover:shadow-card-hover">
                    <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Модуль {mod.orderNumber}: {mod.title}
                        </p>
                        <p className="mt-1 font-medium text-foreground">{s.practicalTask.title}</p>
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
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </DashboardShell>
  );
}
