import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CyberHero } from "@/components/cyber/cyber-hero";
import { findFocusModule, getContinueFromModules } from "@/lib/dashboard-ui";
import { formatLessonCount, formatPracticeCount, getUserTrackLevel } from "@/lib/course-path-ui";
import type { UserCourseProgressResult } from "@/lib/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ProgressRing } from "@/components/ui/progress-ring";
import { cyber } from "@/lib/design-system/cyber";
import { cn } from "@/lib/utils";

export function CourseTrackHero({ data }: { data: UserCourseProgressResult }) {
  const modules = data.modules;
  const doneCount = modules.filter((m) => m.moduleCompleted).length;
  const totalCount = modules.length;
  const focus = findFocusModule(modules);
  const level = getUserTrackLevel(doneCount, totalCount);
  const cta = getContinueFromModules(modules, data.course.title);
  const allDone = totalCount > 0 && doneCount === totalCount;

  const lessonsTotal = modules.reduce((a, m) => a + m.contentCounts.lessons, 0);
  const practiceTotal = modules.reduce((a, m) => a + m.contentCounts.practices, 0);
  const ringTone = data.overallProgressPercent >= 100 ? "success" : "default";

  return (
    <CyberHero className="ce-course-overview-header border-primary/20" padding="default" labelledBy="course-overview-heading">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(240px,300px)] lg:items-center">
        <div className="min-w-0 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary" className="font-mono text-2.5 uppercase tracking-wider">
              Learn OS · Mission track
            </Badge>
            <Badge variant="outline" className="border-primary/25 font-mono text-2.5 uppercase tracking-widest">
              {level.label}
            </Badge>
          </div>

          <div className="space-y-3">
            <h1 id="course-overview-heading" className="typo-h1 text-balance sm:text-3xl">
              {data.course.title}
            </h1>
            <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              {data.course.description?.trim() ||
                "Визуальная карта курса: модули открываются по порядку. В каждом — уроки, тест и практическая лаборатория."}
            </p>
          </div>

          {!allDone && focus ? (
            <p className="text-sm text-muted-foreground">
              Текущая миссия:{" "}
              <span className="font-medium text-foreground">
                модуль {focus.module.orderNumber} · {focus.module.title}
              </span>
            </p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg" className="w-full shadow-card sm:w-auto">
              <Link href={cta.href}>
                {allDone ? "Перейти к сертификату" : "Продолжить"}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
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
              size={88}
              strokeWidth={7}
              label={allDone ? "Готово" : "Курс"}
            />
          </div>
          <ProgressBar
            value={data.overallProgressPercent}
            max={100}
            label={`Модули: ${doneCount} / ${totalCount}`}
            tone={allDone ? "success" : "default"}
          />
          <p className="text-xs text-muted-foreground">
            {formatLessonCount(lessonsTotal)} · {formatPracticeCount(practiceTotal)} · {level.hint}
          </p>
        </aside>
      </div>
    </CyberHero>
  );
}
