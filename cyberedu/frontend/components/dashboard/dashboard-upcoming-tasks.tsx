import Link from "next/link";
import { BookOpen, ClipboardCheck, FlaskConical } from "lucide-react";
import type { DashboardUpcomingTask } from "@/lib/dashboard-ui";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard } from "@/components/ui/glass-card";
import { SectionHeader } from "@/components/ui/section-header";

const kindIcon = {
  lesson: BookOpen,
  test: ClipboardCheck,
  practice: FlaskConical,
} as const;

export function DashboardUpcomingTasks({ tasks }: { tasks: DashboardUpcomingTask[] }) {
  return (
    <section className="space-y-4" aria-labelledby="dash-tasks-heading">
      <SectionHeader
        title="Ближайшие шаги"
        description="Тесты и практика в текущей траектории. Дедлайны в платформе не заданы — двигайтесь в своём темпе."
      />
      <h2 id="dash-tasks-heading" className="sr-only">
        Ближайшие шаги
      </h2>
      {tasks.length === 0 ? (
        <EmptyState
          className="py-10"
          title="Все шаги по текущим модулям закрыты"
          description="Откройте карту курса или перейдите к следующему модулю, когда он разблокируется."
        />
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => {
            const Icon = kindIcon[task.kind];
            return (
              <li key={task.id}>
                <GlassCard className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
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
                </GlassCard>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
