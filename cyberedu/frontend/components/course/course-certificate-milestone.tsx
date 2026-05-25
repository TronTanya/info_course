import Link from "next/link";
import { Award, CheckCircle2, Lock } from "lucide-react";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { getCourseTrackSummary } from "@/lib/course-path-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CourseCertificateMilestone({ modules }: { modules: CourseProgressModuleRow[] }) {
  const summary = getCourseTrackSummary(modules);
  const isLastConnectorDone = modules.length > 0 && modules[modules.length - 1]?.moduleCompleted;

  return (
    <li className="ce-roadmap-cert relative grid grid-cols-[auto_1fr] gap-3 sm:gap-5">
      <div className="flex flex-col items-center pt-1">
        <div
          className={cn(
            "relative z-[1] flex size-11 shrink-0 items-center justify-center rounded-2xl border-2 sm:size-12",
            summary.allModulesComplete
              ? "border-success/50 bg-success/15 text-success shadow-[0_0_20px_color-mix(in_oklab,var(--success)_28%,transparent)]"
              : "border-muted-foreground/35 bg-muted/30 text-muted-foreground",
          )}
          aria-hidden
        >
          {summary.allModulesComplete ? (
            <CheckCircle2 className="size-5" strokeWidth={1.75} />
          ) : (
            <Lock className="size-4" />
          )}
        </div>
        <div
          className={cn(
            "mt-2 w-0.5 h-4 rounded-full",
            isLastConnectorDone ? "bg-success/40" : "bg-border/60",
          )}
          aria-hidden
        />
      </div>

      <article
        className={cn(
          "mb-2 min-w-0 rounded-2xl border p-4 sm:p-5",
          summary.allModulesComplete
            ? "border-success/30 bg-success/5 shadow-[0_0_32px_-12px_color-mix(in_oklab,var(--success)_35%,transparent)]"
            : "border-border/80 bg-muted/15",
        )}
      >
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl border",
              summary.allModulesComplete
                ? "border-success/35 bg-success/10 text-success"
                : "border-border/80 bg-card/60 text-muted-foreground",
            )}
          >
            <Award className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-semibold text-foreground">Сертификат CyberEdu</h3>
            <p className="mt-1 text-sm leading-relaxed text-pretty text-muted-foreground">{summary.certificateHint}</p>
            {summary.allModulesComplete ? (
              <Button asChild variant="primary" size="sm" className="mt-4">
                <Link href="/dashboard/certificate">Получить сертификат</Link>
              </Button>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                Финишная точка трека — откроется после прохождения всех модулей.
              </p>
            )}
          </div>
        </div>
      </article>
    </li>
  );
}
