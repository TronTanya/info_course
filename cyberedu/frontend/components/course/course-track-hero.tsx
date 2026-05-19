import Link from "next/link";
import { CyberHero } from "@/components/cyber/cyber-hero";
import { findFocusModule, getContinueFromModules } from "@/lib/dashboard-ui";
import {
  formatLessonCount,
  formatPracticeCount,
  getUserTrackLevel,
} from "@/lib/course-path-ui";
import type { UserCourseProgressResult } from "@/lib/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ProgressRing } from "@/components/ui/progress-ring";
import { cyber } from "@/lib/design-system/cyber";
import { cn } from "@/lib/utils";

type CourseTrackHeroProps = {
  data: UserCourseProgressResult;
};

export function CourseTrackHero({ data }: CourseTrackHeroProps) {
  const modules = data.modules;
  const doneCount = modules.filter((m) => m.moduleCompleted).length;
  const totalCount = modules.length;
  const focus = findFocusModule(modules);
  const level = getUserTrackLevel(doneCount, totalCount);
  const cta = getContinueFromModules(modules, data.course.title);
  const allDone = totalCount > 0 && doneCount === totalCount;

  const lessonsTotal = modules.reduce((a, m) => a + m.contentCounts.lessons, 0);
  const practiceTotal = modules.reduce((a, m) => a + m.contentCounts.practices, 0);

  const ringTone = data.overallProgressPercent >= 100 ? "success" : doneCount > 0 ? "default" : "default";

  return (
    <CyberHero className="ce-course-track-hero" padding="default">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:items-start">
        <div className="min-w-0 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary" className="font-mono uppercase tracking-wider">
              Cyber Lab Track
            </Badge>
            <Badge variant="outline" className="border-primary/25 font-mono text-[10px] uppercase tracking-widest">
              {level.label}
            </Badge>
          </div>
          <div className="space-y-3">
            <h1 className="typo-h1 text-balance sm:text-3xl">Учебный трек</h1>
            <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              {data.course.description?.trim() ||
                "Карта прохождения киберлаборатории: модули открываются по порядку. В каждом блоке — уроки, тесты и практические сценарии."}
            </p>
          </div>

          <div className={cn(cyber.panelStatic, "p-4 sm:p-5")}>
            <p className={cyber.monoLabel}>Следующий модуль</p>
            {allDone ? (
              <p className="mt-2 text-base font-semibold text-foreground">Все модули трека завершены</p>
            ) : focus ? (
              <>
                <p className="mt-2 text-base font-semibold leading-snug text-foreground">
                  {focus.module.orderNumber}. {focus.module.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Прогресс модуля:{" "}
                  <span className="font-semibold tabular-nums text-foreground">{focus.progressPercent}%</span>
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Завершите предыдущий модуль, чтобы открыть следующий.
              </p>
            )}
            <p className="mt-2 font-mono text-[11px] text-subtle-foreground">{level.hint}</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={cta.href}>{allDone ? "Сертификат" : cta.label}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full border-primary/25 sm:w-auto">
              <Link href="/dashboard">Кабинет</Link>
            </Button>
          </div>
        </div>

        <aside className={cn(cyber.panelStatic, "space-y-4 border-primary/25 p-5")}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="typo-label">Общий прогресс</p>
              <p className="mt-0.5 font-display text-4xl font-bold tabular-nums text-foreground">
                {data.overallProgressPercent}%
              </p>
            </div>
            <ProgressRing
              value={data.overallProgressPercent}
              tone={ringTone}
              size={80}
              strokeWidth={7}
              label="Завершённые модули"
            />
          </div>

          <ProgressBar
            value={data.overallProgressPercent}
            max={100}
            label="Модули трека"
            tone={allDone ? "success" : "default"}
          />

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl border border-border/80 bg-muted/30 px-2 py-2.5">
              <p className="font-mono text-lg font-bold tabular-nums text-foreground">
                {doneCount}/{totalCount || "—"}
              </p>
              <p className="typo-label text-muted-foreground">модулей</p>
            </div>
            <div className="rounded-xl border border-border/80 bg-muted/30 px-2 py-2.5">
              <p className="font-mono text-lg font-bold tabular-nums text-primary">{data.totalScore}</p>
              <p className="typo-label text-muted-foreground">баллов</p>
            </div>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/8 px-3 py-2.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{formatLessonCount(lessonsTotal)}</span>
            {" · "}
            <span className="font-semibold text-foreground">{formatPracticeCount(practiceTotal)}</span> в треке
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-border/70 pt-3">
            <span className="text-xs text-muted-foreground">Ваш уровень</span>
            <span className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-xs font-semibold text-primary">
              {Array.from({ length: level.tier }).map((_, i) => (
                <span key={i} className="size-1.5 rounded-full bg-primary" aria-hidden />
              ))}
              {level.label}
            </span>
          </div>
        </aside>
      </div>
    </CyberHero>
  );
}
