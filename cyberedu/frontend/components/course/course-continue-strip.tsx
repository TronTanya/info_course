import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { findFocusModule, getContinueFromModules } from "@/lib/dashboard-ui";
import { getModuleAction, getNextRoadmapStep } from "@/lib/course-path-ui";
import type { UserCourseProgressResult } from "@/lib/progress";
import { Button } from "@/components/ui/button";

export function CourseContinueStrip({ data }: { data: UserCourseProgressResult }) {
  const focus = findFocusModule(data.modules);
  const cta = getContinueFromModules(data.modules, data.course.title);
  const action = focus ? getModuleAction(focus) : null;
  const nextStep = focus ? getNextRoadmapStep(focus) : null;
  const continueHref = nextStep?.href && !action?.disabled ? nextStep.href : cta.href;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Что сделать дальше</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {focus ? (
            <>
              Модуль {focus.module.orderNumber}: <span className="font-medium text-foreground">{focus.module.title}</span>
              {nextStep ? (
                <>
                  {" "}
                  — <span className="text-foreground">{nextStep.stepLabel}</span>
                  {nextStep.blockedHint ? (
                    <span className="mt-1 block text-xs text-muted-foreground">{nextStep.blockedHint}</span>
                  ) : null}
                </>
              ) : action ? (
                ` — ${action.label.toLowerCase()}`
              ) : null}
            </>
          ) : (
            cta.hint
          )}
        </p>
      </div>
      <Button asChild size="lg" className="w-full shrink-0 sm:w-auto">
        <Link href={continueHref}>
          {cta.label}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </Button>
    </div>
  );
}
