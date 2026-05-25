import Link from "next/link";
import { BookOpen, ClipboardCheck, FlaskConical, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionCard } from "@/components/ui/section-card";
import {
  CONTENT_MANAGEMENT_UNCONFIGURED_MESSAGE,
  contentManagementDraftsTotal,
  type ContentEditorRouteKey,
  type ContentManagementPreviewData,
} from "@/lib/content-management-preview-logic";

const METRIC_ICONS: Record<ContentEditorRouteKey, typeof Layers> = {
  modules: Layers,
  lessons: BookOpen,
  tests: ClipboardCheck,
  practices: FlaskConical,
};

const METRIC_LABELS: Record<ContentEditorRouteKey, string> = {
  modules: "Модули",
  lessons: "Уроки",
  tests: "Тесты",
  practices: "Практики",
};

function DraftsSummary({ drafts }: { drafts: NonNullable<ContentManagementPreviewData["drafts"]> }) {
  const parts: string[] = [];
  if (drafts.inactiveModules > 0) {
    parts.push(`${drafts.inactiveModules} неактивн. модулей`);
  }
  if (drafts.testsWithoutQuestions > 0) {
    parts.push(`${drafts.testsWithoutQuestions} тестов без вопросов`);
  }
  if (parts.length === 0) return null;

  return (
    <p className="mt-3 rounded-xl border border-warning/25 bg-warning/5 px-3 py-2 text-sm text-foreground">
      <span className="font-medium">Черновики / не готово: </span>
      {parts.join(" · ")}
    </p>
  );
}

export function ContentManagementPreview({ data }: { data: ContentManagementPreviewData }) {
  const order: ContentEditorRouteKey[] = ["modules", "lessons", "tests", "practices"];

  return (
    <SectionCard variant="default" flushTitle className="min-w-0 p-4 sm:p-6" id="content-management">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="size-5 text-muted-foreground" aria-hidden />
            <h2 className="font-display text-base font-semibold text-foreground">Управление контентом</h2>
          </div>
          {data.courseTitle ? (
            <p className="mt-1 text-sm text-muted-foreground">Курс: {data.courseTitle}</p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">Сводка материалов курса (без ключей ответов).</p>
          )}
        </div>
        {data.drafts ? (
          <Badge variant="warning" className="shrink-0">
            Черновики: {contentManagementDraftsTotal(data.drafts)}
          </Badge>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-4">
        {order.map((key) => {
          const Icon = METRIC_ICONS[key];
          const value = data.counts[key];
          return (
            <MetricCard
              key={key}
              label={METRIC_LABELS[key]}
              value={String(value)}
              hint="в базе"
              icon={<Icon className="size-4" aria-hidden />}
            />
          );
        })}
      </div>

      {data.drafts ? <DraftsSummary drafts={data.drafts} /> : null}

      {!data.routesConfigured ? (
        <p className="mt-4 text-sm text-muted-foreground" role="status">
          {CONTENT_MANAGEMENT_UNCONFIGURED_MESSAGE}
        </p>
      ) : (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {data.actions.map((action) => (
            <li key={action.key}>
              {action.href ? (
                <Button asChild variant="outline" className="min-h-12 w-full justify-start px-3">
                  <Link href={action.href}>
                    <span className="flex min-w-0 flex-col items-start gap-0.5 text-left">
                      <span className="text-sm font-medium">{action.label}</span>
                      <span className="text-xs font-normal text-muted-foreground tabular-nums">
                        {action.count} в каталоге
                      </span>
                    </span>
                  </Link>
                </Button>
              ) : (
                <div className="flex min-h-12 flex-col justify-center rounded-xl border border-dashed border-border/80 px-3 py-2.5 text-sm text-muted-foreground">
                  {action.label}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {data.routesConfigured ? (
        <Button asChild variant="ghost" size="sm" className="mt-3 min-h-11 w-full sm:w-auto">
          <Link href="/admin/modules/new">Создать модуль</Link>
        </Button>
      ) : null}
    </SectionCard>
  );
}
