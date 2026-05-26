import Link from "next/link";
import { ArrowRight, Award, Lock } from "lucide-react";
import {
  getAfterModulePreview,
  getModuleContentMeta,
  getUiStatus,
  statusBadge,
} from "@/lib/course-path-ui";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";

export function ModuleAfterPreview({
  modules,
  currentModuleId,
  currentModuleCompleted,
}: {
  modules: CourseProgressModuleRow[];
  currentModuleId: string;
  currentModuleCompleted: boolean;
}) {
  const preview = getAfterModulePreview(modules, currentModuleId, currentModuleCompleted);

  if (preview.kind === "none") {
    return null;
  }

  if (preview.kind === "certificate") {
    return (
      <SectionCard variant="accent" className="scroll-mt-24">
        <p className="typo-eyebrow text-primary">Что дальше</p>
        <h2 className="mt-2 font-display text-lg font-semibold text-foreground">Финал трека — сертификат</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Это последний модуль программы. Оформите сертификат с проверкой подлинности.
        </p>
        <Button asChild className="mt-4 w-full sm:w-auto" size="lg">
          <Link href={preview.href}>
            <Award className="size-4" aria-hidden />
            Перейти к сертификату
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </SectionCard>
    );
  }

  const { row, opensWhenComplete } = preview;
  const status = getUiStatus(row);
  const badge = statusBadge[status];
  const meta = getModuleContentMeta(row);
  const desc = row.module.description?.trim() || "Следующий блок трека: лекция, тест и практика.";
  const href = `/dashboard/course/${row.module.id}`;

  return (
    <SectionCard variant="default" className="scroll-mt-24 border-dashed">
      <p className="typo-eyebrow text-primary">Что будет после этого модуля</p>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-2.5 font-bold uppercase tracking-wider text-primary">
              Модуль {row.module.orderNumber}
            </span>
            <span
              className={cn(
                "rounded-md border px-2 py-0.5 text-2.5 font-medium uppercase tracking-wide",
                opensWhenComplete
                  ? "border-muted-foreground/30 text-muted-foreground"
                  : badge.className ?? "border-border text-muted-foreground",
              )}
            >
              {opensWhenComplete ? "Откроется после завершения" : badge.label}
            </span>
          </div>
          <h2 className="font-display text-lg font-semibold text-foreground">{row.module.title}</h2>
          <p className="text-sm text-pretty text-muted-foreground">{desc}</p>
          <p className="text-xs text-muted-foreground">
            {meta.lessonsLabel} · {meta.testsLabel} · {meta.practicesLabel}
          </p>
        </div>
        {opensWhenComplete ? (
          <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-muted/25 px-4 py-3 text-sm text-muted-foreground sm:max-w-xs">
            <Lock className="size-4 shrink-0" aria-hidden />
            Завершите текущий модуль, чтобы открыть следующий в цепочке.
          </div>
        ) : (
          <Button asChild className="w-full shrink-0 sm:w-auto" size="lg">
            <Link href={href}>
              Обзор модуля
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        )}
      </div>
    </SectionCard>
  );
}
