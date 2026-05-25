import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { ProfileCompletedModule } from "@/lib/profile-course-stats";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export function ProfileCompletedModules({ modules }: { modules: ProfileCompletedModule[] }) {
  return (
    <SectionCard variant="default" flushTitle className="p-4 sm:p-6" aria-labelledby="profile-modules-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 id="profile-modules-heading" className="font-display text-base font-semibold text-foreground sm:text-lg">
            Пройденные модули
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Модули с полным зачётом по программе курса.</p>
        </div>
        {modules.length > 0 ? (
          <p className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">{modules.length} шт.</p>
        ) : null}
      </div>

      {modules.length === 0 ? (
        <EmptyState
          className="mt-4 py-8"
          title="Пока нет завершённых модулей"
          description="Пройдите лекцию, тест и практику в первом доступном модуле."
          action={
            <Button asChild variant="primary" size="sm">
              <Link href="/dashboard/course">К карте курса</Link>
            </Button>
          }
        />
      ) : (
        <ul className="mt-4 flex flex-col gap-2" role="list">
          {modules.map((m) => (
            <li key={m.id} role="listitem">
              <Link
                href={`/dashboard/course/${m.id}`}
                className="ce-completed-module-row flex items-start gap-3 rounded-xl border border-border/70 bg-muted/15 px-3 py-2.5 transition-colors hover:border-primary/25 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-success/30 bg-success/10 text-success"
                  aria-hidden
                >
                  <CheckCircle2 className="size-4" strokeWidth={2} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Модуль {m.orderNumber}
                  </span>
                  <span className="mt-0.5 block text-sm font-medium leading-snug text-pretty text-foreground">
                    {m.title}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
