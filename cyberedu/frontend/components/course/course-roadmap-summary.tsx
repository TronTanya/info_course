import Link from "next/link";
import { Award, CheckCircle2, Lock, MapPin, Route } from "lucide-react";
import type { CourseProgressModuleRow } from "@/lib/progress";
import {
  getCourseTrackSummary,
  getNextRoadmapStep,
  roadmapModuleAnchorId,
} from "@/lib/course-path-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

export function CourseRoadmapSummary({
  modules,
  focusModuleId,
}: {
  modules: CourseProgressModuleRow[];
  focusModuleId?: string | null;
}) {
  const summary = getCourseTrackSummary(modules, focusModuleId);
  const focus = focusModuleId
    ? modules.find((m) => m.module.id === focusModuleId)
    : modules.find((m) => m.unlocked && !m.moduleCompleted);
  const nextStep = focus ? getNextRoadmapStep(focus) : null;

  if (modules.length === 0) return null;

  const progressPct =
    summary.totalModules > 0
      ? Math.round((summary.completedModules / summary.totalModules) * 100)
      : 0;

  return (
    <section
      className="ce-course-roadmap-summary ce-glass rounded-2xl border border-primary/20 bg-card/70 p-4 shadow-card sm:p-5"
      aria-labelledby="course-position-heading"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary" className="gap-1 font-mono text-[10px] uppercase tracking-wider">
              <MapPin className="size-3" aria-hidden />
              Ваш прогресс
            </Badge>
            {!summary.allModulesComplete && summary.focusOrder ? (
              <Badge variant="outline" className="border-primary/30 text-primary">
                Модуль {summary.focusOrder} активен
              </Badge>
            ) : null}
          </div>

          <div>
            <h2 id="course-position-heading" className="font-display text-lg font-semibold text-foreground sm:text-xl">
              {summary.positionLabel}
            </h2>
            {summary.focusTitle && !summary.allModulesComplete ? (
              <p className="mt-1 text-sm text-pretty text-muted-foreground">
                <span className="font-medium text-foreground">{summary.focusTitle}</span>
                {nextStep ? (
                  <>
                    {" "}
                    — следующий шаг: <span className="text-primary">{nextStep.stepLabel.toLowerCase()}</span>
                  </>
                ) : null}
              </p>
            ) : null}
          </div>

          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-success" aria-hidden />
              <span>
                Завершено: <strong className="text-foreground">{summary.completedModules}</strong>
              </span>
            </li>
            <li className="flex items-center gap-1.5">
              <Route className="size-3.5 text-primary" aria-hidden />
              <span>
                В работе: <strong className="text-foreground">{summary.inProgressModules}</strong>
              </span>
            </li>
            <li className="flex items-center gap-1.5">
              <Lock className="size-3.5 text-muted-foreground" aria-hidden />
              <span>
                Закрыто: <strong className="text-foreground">{summary.lockedModules}</strong>
              </span>
            </li>
          </ul>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-3 lg:max-w-xs">
          <ProgressBar
            value={progressPct}
            max={100}
            label={`Модули: ${summary.completedModules} / ${summary.totalModules}`}
            tone={summary.allModulesComplete ? "success" : "default"}
          />
          <div
            className={cn(
              "flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs leading-relaxed",
              summary.allModulesComplete
                ? "border-success/30 bg-success/8 text-foreground"
                : "border-border/80 bg-muted/20 text-muted-foreground",
            )}
          >
            <Award
              className={cn("mt-0.5 size-4 shrink-0", summary.allModulesComplete ? "text-success" : "text-primary")}
              aria-hidden
            />
            <span>{summary.certificateHint}</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {nextStep && focus && !summary.allModulesComplete ? (
              <Button asChild size="sm" variant="primary" className="w-full sm:w-auto">
                <Link href={nextStep.href}>Перейти к шагу</Link>
              </Button>
            ) : null}
            {summary.focusModuleId && !summary.allModulesComplete ? (
              <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                <Link href={`#${roadmapModuleAnchorId(summary.focusModuleId)}`}>На карте ↓</Link>
              </Button>
            ) : null}
            {summary.allModulesComplete ? (
              <Button asChild size="sm" variant="primary" className="w-full sm:w-auto">
                <Link href="/dashboard/certificate">Сертификат</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
