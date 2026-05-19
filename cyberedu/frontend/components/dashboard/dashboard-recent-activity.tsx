import Link from "next/link";
import { BookOpen, ClipboardCheck, FlaskConical } from "lucide-react";
import type { DashboardActivityItem } from "@/lib/dashboard-ui";
import { cyber } from "@/lib/design-system/cyber";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";

const kindIcon = {
  lesson: BookOpen,
  test: ClipboardCheck,
  practice: FlaskConical,
} as const;

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DashboardRecentActivity({ items }: { items: DashboardActivityItem[] }) {
  return (
    <section className="space-y-4" aria-labelledby="dash-activity-heading">
      <SectionHeader title="Недавняя активность" description="Последние лекции, тесты и практика." />
      <h2 id="dash-activity-heading" className="sr-only">
        Недавняя активность
      </h2>
      {items.length === 0 ? (
        <EmptyState
          className="py-10"
          title="Пока нет записей"
          description="Пройдите первую лекцию или тест — здесь появится история действий."
        />
      ) : (
      <ul className="space-y-2">
        {items.map((item) => {
          const Icon = kindIcon[item.kind];
          return (
            <li key={item.id}>
              <div className={cn(cyber.panelStatic, "flex gap-3 p-4")}>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-primary ring-1 ring-border">
                  <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="typo-label text-muted-foreground">{item.label}</p>
                  <p className="mt-0.5 font-medium text-foreground">{item.detail}</p>
                  {item.meta ? <p className="text-sm text-muted-foreground">{item.meta}</p> : null}
                  <p className="typo-caption mt-1">{formatWhen(item.at)}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      )}
      {items.length > 0 ? (
        <p className="text-center text-sm sm:text-left">
          <Link href="/dashboard/profile" className="font-medium text-primary underline-offset-4 hover:underline">
            Вся история в профиле
          </Link>
        </p>
      ) : null}
    </section>
  );
}
