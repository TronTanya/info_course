import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import { completionLevelLabel } from "@/lib/admin-a11y";
import {
  COURSE_HEALTH_EMPTY_MESSAGE,
  courseHealthPanelHasInsights,
  type CourseHealthPanelData,
} from "@/lib/course-health-panel-logic";

function HealthSubsection({
  title,
  empty,
  hasItems,
  children,
}: {
  title: string;
  empty: string;
  hasItems: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {hasItems ? <div className="mt-2">{children}</div> : <p className="mt-2 text-sm text-muted-foreground">{empty}</p>}
    </div>
  );
}

function completionBadgeVariant(percent: number): "danger" | "warning" {
  return percent < 40 ? "danger" : "warning";
}

export function CourseHealthPanel({ data }: { data: CourseHealthPanelData }) {
  if (!data.hasStudentActivity) {
    return (
      <SectionCard variant="default" flushTitle className="min-w-0 p-4 sm:p-6" id="course-health">
        <PanelHeader />
        <EmptyState
          compact
          className="mt-4"
          title={COURSE_HEALTH_EMPTY_MESSAGE}
          description="Когда появятся попытки тестов, прогресс по модулям или отправки практик, здесь отобразятся агрегированные метрики."
        />
      </SectionCard>
    );
  }

  const showGlobalQuiet =
    !courseHealthPanelHasInsights(data);

  return (
    <SectionCard variant="default" flushTitle className="min-w-0 p-4 sm:p-6" id="course-health">
      <PanelHeader />
      {showGlobalQuiet ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Пока нет выраженных отклонений. Метрики обновятся по мере накопления данных.
        </p>
      ) : null}

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <HealthSubsection
          title="Модули с низким completion"
          empty="Все модули выше 70% завершения."
          hasItems={data.lowCompletionModules.length > 0}
        >
          {data.lowCompletionModules.length > 0 ? (
            <ul className="space-y-2">
              {data.lowCompletionModules.map((m) => (
                <li key={m.moduleId}>
                  <div className="flex flex-col gap-2 rounded-lg border border-border/70 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{m.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Завершение:{" "}
                        <Badge variant={completionBadgeVariant(m.completionPercent)} className="ml-1">
                          {m.completionPercent}% · {completionLevelLabel(m.completionPercent)}
                        </Badge>
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline" className="min-h-11 shrink-0">
                      <Link href={m.href}>Открыть модуль</Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </HealthSubsection>

        <HealthSubsection
          title="Тесты с высоким fail rate"
          empty="Нет выраженных провалов по попыткам."
          hasItems={data.highFailTests.length > 0}
        >
          {data.highFailTests.length > 0 ? (
            <ul className="space-y-2">
              {data.highFailTests.map((t) => (
                <li key={t.testId}>
                  <div className="flex flex-col gap-2 rounded-lg border border-border/70 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{t.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.moduleTitle} · fail rate {t.failRatePercent}% ({t.attempts} попыток)
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline" className="min-h-11 shrink-0">
                      <Link href={t.href}>Посмотреть тест</Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </HealthSubsection>

        <HealthSubsection
          title="Сложные темы"
          empty="Нет статистики по ошибкам в вопросах."
          hasItems={data.difficultTopics.length > 0}
        >
          {data.difficultTopics.length > 0 ? (
            <ul className="space-y-2">
              {data.difficultTopics.map((topic) => (
                <li key={topic.topicId}>
                  <div className="flex flex-col gap-2 rounded-lg border border-border/70 bg-muted/15 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-medium text-foreground">{topic.topic}</p>
                      <p className="text-xs text-muted-foreground">
                        {topic.moduleTitle}
                        {topic.mentionCount > 0 ? ` · ошибок: ${topic.mentionCount}` : ""}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline" className="min-h-11 shrink-0">
                      <Link href={topic.href}>Открыть связанные уроки</Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </HealthSubsection>

        <HealthSubsection
          title="Drop-off points"
          empty="Нет выраженных точек отсева."
          hasItems={data.dropOffPoints.length > 0}
        >
          {data.dropOffPoints.length > 0 ? (
            <ul className="space-y-2">
              {data.dropOffPoints.map((point) => (
                <li key={point.id}>
                  <div className="flex flex-col gap-2 rounded-lg border border-border/70 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{point.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {point.kindLabel} · {point.moduleTitle} · {point.stalledCount} студ.
                      </p>
                    </div>
                    <Button asChild size="sm" variant="ghost" className="min-h-11 shrink-0">
                      <Link href={point.href}>
                        {point.kind === "practice" ? "Открыть практику" : "Открыть модуль"}
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </HealthSubsection>
      </div>
    </SectionCard>
  );
}

function PanelHeader() {
  return (
    <>
      <div className="flex items-center gap-2">
        <AlertTriangle className="size-5 text-warning" aria-hidden />
        <h2 className="font-display text-lg font-semibold text-foreground">Здоровье курса</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Агрегированные метрики по прогрессу, тестам и практике. Без ответов студентов и ключей проверки.
      </p>
    </>
  );
}
