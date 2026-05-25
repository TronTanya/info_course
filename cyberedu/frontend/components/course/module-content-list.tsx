import Link from "next/link";
import { Lock, RotateCcw } from "lucide-react";
import { CourseStepIcon } from "@/components/course/course-step-icon";
import type { CourseStepIconKind, CourseStepIconStatus } from "@/lib/course-step-icons";
import type { ModuleContentListData } from "@/lib/module-content-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function statusBadgeClass(tone: "muted" | "primary" | "success" | "danger" | "warning" | "cyan"): string {
  switch (tone) {
    case "success":
      return "border-success/35 bg-success/10 text-success";
    case "danger":
      return "border-danger/35 bg-danger/10 text-danger";
    case "warning":
      return "border-warning/35 bg-warning/10 text-warning";
    case "cyan":
      return "border-cyan/35 bg-cyan/10 text-cyan";
    case "primary":
      return "border-primary/35 bg-primary/10 text-primary";
    default:
      return "border-border/80 bg-muted/25 text-muted-foreground";
  }
}

function lessonTone(status: string): "muted" | "primary" | "success" | "danger" | "warning" | "cyan" {
  if (status === "completed") return "success";
  if (status === "in_progress") return "primary";
  if (status === "locked") return "muted";
  return "muted";
}

function testTone(status: string): "muted" | "primary" | "success" | "danger" | "warning" | "cyan" {
  if (status === "passed") return "success";
  if (status === "failed") return "danger";
  if (status === "in_progress") return "primary";
  if (status === "locked") return "muted";
  return "muted";
}

function practiceTone(status: string): "muted" | "primary" | "success" | "danger" | "warning" | "cyan" {
  if (status === "approved") return "success";
  if (status === "needs_retry") return "danger";
  if (status === "pending_review" || status === "submitted") return "cyan";
  if (status === "locked") return "muted";
  return "muted";
}

function toneToIconStatus(tone: "muted" | "primary" | "success" | "danger" | "warning" | "cyan"): CourseStepIconStatus {
  if (tone === "success") return "completed";
  if (tone === "primary") return "in_progress";
  if (tone === "danger") return "needs_retry";
  if (tone === "warning") return "pending_review";
  if (tone === "cyan") return "available";
  return "locked";
}

function ContentRow({
  iconKind,
  title,
  subtitle,
  meta,
  statusLabel,
  tone,
  href,
  ctaLabel,
  ctaDisabled,
}: {
  iconKind: CourseStepIconKind;
  title: string;
  subtitle?: string;
  meta: { label: string; value: string }[];
  statusLabel: string;
  tone: "muted" | "primary" | "success" | "danger" | "warning" | "cyan";
  href: string;
  ctaLabel: string;
  ctaDisabled: boolean;
}) {
  const done = tone === "success";

  return (
    <li
      className={cn(
        "ce-module-content-row flex min-h-[5.5rem] flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5",
        tone === "success" && "border-success/25 bg-success/5",
        tone === "primary" && "border-primary/25 bg-primary/5",
        tone === "danger" && "border-danger/25 bg-danger/5",
        tone === "cyan" && "border-cyan/25 bg-cyan/5",
        tone === "warning" && "border-warning/25 bg-warning/5",
        tone === "muted" && "border-border/70 bg-muted/15 opacity-95",
      )}
    >
      <div className="flex min-w-0 flex-1 gap-3">
        <CourseStepIcon kind={iconKind} size="md" status={toneToIconStatus(tone)} />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-semibold leading-snug text-foreground sm:text-lg">{title}</h3>
            <Badge variant="outline" className={cn("shrink-0 text-[10px]", statusBadgeClass(tone))}>
              {statusLabel}
            </Badge>
          </div>
          {subtitle ? <p className="text-sm text-pretty text-muted-foreground">{subtitle}</p> : null}
          <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {meta.map((m) => (
              <div key={m.label}>
                <dt className="sr-only">{m.label}</dt>
                <dd>
                  <span className="text-subtle-foreground">{m.label}: </span>
                  <span className="font-medium text-foreground">{m.value}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="shrink-0 sm:min-w-[11rem]">
        {ctaDisabled ? (
          <Button variant="outline" disabled className="min-h-11 w-full gap-2" type="button">
            <Lock className="size-4 opacity-70" aria-hidden />
            {ctaLabel}
          </Button>
        ) : (
          <Button
            asChild
            variant={done || tone === "cyan" ? "outline" : "primary"}
            className="min-h-11 w-full focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Link href={href}>
              {ctaLabel.includes("Повтор") ? <RotateCcw className="size-4" aria-hidden /> : null}
              {ctaLabel}
            </Link>
          </Button>
        )}
      </div>
    </li>
  );
}

export function ModuleContentList({ data }: { data: ModuleContentListData }) {
  const hasLessons = data.lessons.length > 0;
  const hasPractices = data.practices.length > 0;

  return (
    <div className="ce-module-content-list space-y-8" aria-labelledby="module-content-list-heading">
      <p id="module-content-list-heading" className="sr-only">
        Содержание модуля
      </p>

      {hasLessons ? (
        <section aria-labelledby="module-content-lessons-heading" className="space-y-3">
          <h2 id="module-content-lessons-heading" className="typo-eyebrow text-primary">
            Уроки
          </h2>
          <ul className="flex flex-col gap-3">
            {data.lessons.map((lesson) => (
              <ContentRow
                key={lesson.id}
                iconKind="lesson"
                title={lesson.title}
                meta={[
                  { label: "Время", value: lesson.readingTimeLabel },
                  ...(lesson.hasVideo ? [{ label: "Формат", value: "Текст и видео" }] : []),
                ]}
                statusLabel={lesson.statusLabel}
                tone={lessonTone(lesson.status)}
                href={lesson.href}
                ctaLabel={lesson.ctaLabel}
                ctaDisabled={lesson.ctaDisabled}
              />
            ))}
          </ul>
        </section>
      ) : null}

      {data.test ? (
        <section aria-labelledby="module-content-test-heading" className="space-y-3">
          <h2 id="module-content-test-heading" className="typo-eyebrow text-primary">
            Тест
          </h2>
          <ul className="flex flex-col gap-3">
            <ContentRow
              iconKind="test"
              title={data.test.title}
              subtitle="Контрольные вопросы по материалу модуля. Ответы и разбор — только после вашей отправки."
              meta={[
                { label: "Вопросы", value: data.test.questionCountLabel },
                { label: "Время", value: data.test.durationLabel },
              ]}
              statusLabel={data.test.statusLabel}
              tone={testTone(data.test.status)}
              href={data.test.href}
              ctaLabel={data.test.ctaLabel}
              ctaDisabled={data.test.ctaDisabled}
            />
          </ul>
        </section>
      ) : null}

      {hasPractices ? (
        <section aria-labelledby="module-content-practice-heading" className="space-y-3">
          <h2 id="module-content-practice-heading" className="typo-eyebrow text-primary">
            Практика
          </h2>
          <ul className="flex flex-col gap-3">
            {data.practices.map((task) => (
              <ContentRow
                key={task.id}
                iconKind="practice"
                title={task.title}
                subtitle="Учебная лаборатория: сценарий и проверка без раскрытия эталонных решений."
                meta={[
                  { label: "Сложность", value: task.difficultyLabel },
                  { label: "Время", value: task.durationLabel },
                ]}
                statusLabel={task.statusLabel}
                tone={practiceTone(task.status)}
                href={task.href}
                ctaLabel={task.ctaLabel}
                ctaDisabled={task.ctaDisabled}
              />
            ))}
          </ul>
        </section>
      ) : null}

      {!hasLessons && !data.test && !hasPractices ? (
        <p className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
          Содержимое модуля появится после настройки программы.
        </p>
      ) : null}
    </div>
  );
}
