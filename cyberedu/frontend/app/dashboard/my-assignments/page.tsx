import type { Metadata } from "next";
import Link from "next/link";
import type { SubmissionStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { MyAssignmentsList, type AssignmentListItem } from "@/components/assignments/my-assignments-list";
import { LearnPageHeader, LearnPageShell } from "@/components/learn/learn-chrome";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Мои задания",
};

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

  const items: AssignmentListItem[] = submissions.map((s) => ({
    id: s.id,
    status: s.status as SubmissionStatus,
    score: s.score,
    updatedAt: s.updatedAt.toISOString(),
    taskTitle: s.practicalTask.title,
    moduleId: s.practicalTask.module.id,
    moduleTitle: s.practicalTask.module.title,
    moduleOrder: s.practicalTask.module.orderNumber,
  }));

  return (
    <DashboardShell>
      <LearnPageShell>
        <LearnPageHeader
          backHref="/dashboard"
          backLabel="← Кабинет"
          eyebrow="Практика"
          title="Мои задания"
          subtitle="Практические работы по курсу: статус проверки и быстрый переход к заданию."
        />

        {items.length === 0 ? (
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
          <MyAssignmentsList items={items} />
        )}
      </LearnPageShell>
    </DashboardShell>
  );
}
