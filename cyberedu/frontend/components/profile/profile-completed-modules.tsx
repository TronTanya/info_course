import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { ProfileCompletedModule } from "@/lib/profile-course-stats";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export function ProfileCompletedModules({ modules }: { modules: ProfileCompletedModule[] }) {
  return (
    <SectionCard variant="default" flushTitle className="p-4 sm:p-6" aria-labelledby="profile-modules-heading">
      <h2 id="profile-modules-heading" className="font-display text-base font-semibold text-foreground sm:text-lg">
        Пройденные модули
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Модули с полным зачётом по программе курса.
      </p>

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
        <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-1">
          {modules.map((m) => (
            <li key={m.id}>
              <Link
                href={`/dashboard/course/${m.id}`}
                className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/15 px-3 py-2.5 transition-colors hover:border-primary/25 hover:bg-primary/5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
              >
                <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden />
                <span className="font-mono text-2.5 font-bold uppercase tracking-wider text-muted-foreground">
                  Модуль {m.orderNumber}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{m.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
