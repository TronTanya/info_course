import Link from "next/link";
import { BookOpen, ClipboardCheck, FlaskConical } from "lucide-react";
import type { DashboardUpcomingTask } from "@/lib/dashboard-ui";
import { cyber } from "@/lib/design-system/cyber";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils";

const kindIcon = {
  lesson: BookOpen,
  test: ClipboardCheck,
  practice: FlaskConical,
} as const;

export function DashboardUpcomingTasks({ tasks }: { tasks: DashboardUpcomingTask[] }) {
  return (
    <section className="space-y-4" aria-labelledby="dash-tasks-heading">
      <SectionHeader
        titleId="dash-tasks-heading"
        title="Ближайшие шаги"
        description="Тесты и практика в текущей траектории. Дедлайны в платформе не заданы — двигайтесь в своём темпе."
      />
      {tasks.length === 0 ? (
        <EmptyState
          compact
          className="py-6"
          title="Все шаги по текущим модулям закрыты"
          description="Откройте карту курса или перейдите к следующему модулю, когда он разблокируется."
          action={
            <Button asChild variant="primary" size="sm">
              <Link href="/dashboard/course">К карте курса</Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => {
            const Icon = kindIcon[task.kind];
            return (
              <li key={task.id}>
                <div
                  className={cn(
                    cyber.panelStatic,
                    "flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between",
                  )}
                >
                  <div className="flex min-w-0 gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-primary">
                      <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{task.title}</p>
                      <p className="text-sm text-muted-foreground">Модуль: {task.moduleTitle}</p>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm" className="w-full shrink-0 sm:w-auto">
                    <Link href={task.href}>Перейти</Link>
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
