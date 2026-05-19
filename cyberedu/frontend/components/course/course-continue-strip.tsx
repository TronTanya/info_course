import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { findFocusModule, getContinueFromModules } from "@/lib/dashboard-ui";
import { getModuleAction } from "@/lib/course-path-ui";
import type { UserCourseProgressResult } from "@/lib/progress";
import { Button } from "@/components/ui/button";

export function CourseContinueStrip({ data }: { data: UserCourseProgressResult }) {
  const focus = findFocusModule(data.modules);
  const cta = getContinueFromModules(data.modules, data.course.title);
  const action = focus ? getModuleAction(focus) : null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Продолжить обучение</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {focus ? (
            <>
              Модуль {focus.module.orderNumber}: <span className="font-medium text-foreground">{focus.module.title}</span>
              {action ? ` — ${action.label.toLowerCase()}` : ""}
            </>
          ) : (
            cta.hint
          )}
        </p>
      </div>
      <Button asChild size="lg" className="w-full shrink-0 sm:w-auto">
        <Link href={cta.href}>
          {cta.label}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </Button>
    </div>
  );
}
