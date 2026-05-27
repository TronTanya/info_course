import Link from "next/link";
import { Compass } from "lucide-react";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import { getContinueTarget } from "@/lib/dashboard-ui";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { Button } from "@/components/ui/button";

export function DashboardOnboardingBanner({
  stats,
  modules,
}: {
  stats: ProfileCourseStats;
  modules: CourseProgressModuleRow[];
}) {
  if (stats.allModulesComplete || stats.progressPercent > 12) return null;

  const target = getContinueTarget(stats, modules);
  const firstModule = modules.find((m) => m.unlocked) ?? modules[0];

  return (
    <div
      className="ce-cockpit-span-12 rounded-2xl border border-primary/25 bg-linear-to-br from-primary/10 via-card to-card p-4 sm:p-5"
      role="region"
      aria-label="С чего начать"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
            <Compass className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0 space-y-1">
            <h2 className="font-heading text-base font-semibold text-foreground sm:text-lg">
              Добро пожаловать — начните с первого шага
            </h2>
            <p className="text-sm text-pretty text-muted-foreground">
              {firstModule
                ? `Откройте модуль «${firstModule.module.title}»: лекция, затем тест и практика. Прогресс сохраняется автоматически.`
                : "Откройте карту курса и выберите доступный модуль."}
            </p>
            <ol className="mt-2 list-inside list-decimal text-xs text-muted-foreground sm:text-sm">
              <li>Прочитайте лекцию и отметьте изученным</li>
              <li>Сдайте короткий тест модуля</li>
              <li>Закрепите навык в SOC-лаборатории</li>
            </ol>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <Button asChild size="sm" className="w-full rounded-xl sm:w-auto">
            <Link href={target.href}>{target.label}</Link>
          </Button>
          <Button asChild size="sm" variant="ghost" className="w-full rounded-xl text-muted-foreground sm:w-auto">
            <Link href="/dashboard/course">Карта курса</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
