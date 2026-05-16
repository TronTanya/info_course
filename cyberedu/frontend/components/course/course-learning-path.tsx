import Link from "next/link";
import type { ComponentProps } from "react";
import type { CourseProgressModuleRow, ModuleRequirements, UserCourseProgressResult } from "@/lib/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { cn } from "@/lib/utils";

const LOCK_HINT = "Завершите предыдущий модуль";

type UiStatus = "locked" | "available" | "in_progress" | "completed";

function getUiStatus(row: CourseProgressModuleRow): UiStatus {
  if (!row.unlocked) return "locked";
  if (row.moduleCompleted) return "completed";
  const p = row.progress;
  const started =
    Boolean(p?.lessonCompleted) ||
    Boolean(p?.videoCompleted) ||
    Boolean(p?.testCompleted) ||
    Boolean(p?.practiceCompleted) ||
    row.progressPercent > 0;
  return started ? "in_progress" : "available";
}

const statusBadge: Record<
  UiStatus,
  { label: string; variant: NonNullable<ComponentProps<typeof Badge>["variant"]>; className?: string }
> = {
  locked: { label: "Закрыт", variant: "outline", className: "border-muted-foreground/40 text-muted-foreground" },
  available: { label: "Доступен", variant: "success" },
  in_progress: { label: "В процессе", variant: "cyan", className: "border-sky-500/35 bg-sky-500/10 text-sky-800 dark:text-sky-200" },
  completed: { label: "Завершён", variant: "success" },
};

function getModuleAction(row: CourseProgressModuleRow): { href: string; label: string; disabled: boolean } {
  const id = row.module.id;
  const base = `/dashboard/course/${id}`;
  if (!row.unlocked) {
    return { href: "#", label: LOCK_HINT, disabled: true };
  }

  const p = row.progress;
  const req = row.requirements;

  if (row.moduleCompleted) {
    return { href: base, label: "Открыть модуль", disabled: false };
  }

  const lessonDone = !req.lessonRequired || Boolean(p?.lessonCompleted);
  const videoDone = !req.videoRequired || Boolean(p?.videoCompleted);
  const testDone = !req.testRequired || Boolean(p?.testCompleted);
  const practiceDone = !req.practiceRequired || Boolean(p?.practiceCompleted);

  const started = Boolean(p?.lessonCompleted || p?.videoCompleted || p?.testCompleted || p?.practiceCompleted);

  if (!lessonDone) {
    return { href: `${base}/lesson`, label: started ? "Продолжить" : "Начать", disabled: false };
  }
  if (!videoDone) {
    return { href: `${base}/lesson`, label: "Продолжить", disabled: false };
  }
  if (!testDone) {
    return { href: `${base}/test`, label: "Продолжить", disabled: false };
  }
  if (!practiceDone) {
    return { href: `${base}/practice`, label: "Продолжить", disabled: false };
  }

  return { href: base, label: "Открыть модуль", disabled: false };
}

/** Оценка объёма по составу шагов модуля (без отдельного поля в БД). */
function moduleTimeEstimate(req: ModuleRequirements): string {
  let lo = 0;
  let hi = 0;
  if (req.lessonRequired) {
    lo += 40;
    hi += 85;
  }
  if (req.videoRequired) {
    lo += 20;
    hi += 50;
  }
  if (req.testRequired) {
    lo += 25;
    hi += 55;
  }
  if (req.practiceRequired) {
    lo += 40;
    hi += 120;
  }
  if (lo === 0) return "—";
  const loH = Math.max(1, Math.round(lo / 60));
  const hiH = Math.max(loH, Math.round(hi / 60));
  return loH === hiH ? `≈ ${loH} ч` : `≈ ${loH}–${hiH} ч`;
}

function moduleDifficultyLabel(req: ModuleRequirements): string {
  const n = req.totalSteps;
  if (n >= 4) return "Полный цикл";
  if (n === 3) return "Стандарт";
  if (n === 2) return "Компакт";
  return n <= 1 ? "Краткий модуль" : "Стандарт";
}

function currentFocusModule(data: UserCourseProgressResult): CourseProgressModuleRow | null {
  return data.modules.find((m) => m.unlocked && !m.moduleCompleted) ?? null;
}

function continueLearningCta(data: UserCourseProgressResult): { href: string; hint: string } {
  const allDone =
    data.modules.length > 0 && data.modules.every((m) => m.moduleCompleted);
  if (allDone) {
    return {
      href: "/dashboard/certificate",
      hint: "Все модули пройдены — оформите сертификат.",
    };
  }
  const focus = currentFocusModule(data);
  if (!focus) {
    return { href: "/dashboard/course", hint: "Выберите доступный модуль в траектории ниже." };
  }
  const a = getModuleAction(focus);
  return {
    href: a.disabled ? `/dashboard/course/${focus.module.id}` : a.href,
    hint: `Модуль ${focus.module.orderNumber}: «${focus.module.title}».`,
  };
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-4 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M7 11V8a5 5 0 0110 0v3" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("size-4 shrink-0", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("size-3.5 shrink-0", className)} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7L8 5Z" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("size-4 shrink-0", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2Z" strokeLinejoin="round" />
    </svg>
  );
}

function StepIcon({ locked, done }: { locked: boolean; done: boolean }) {
  if (locked) {
    return <LockIcon className="text-muted-foreground" />;
  }
  if (done) {
    return (
      <span
        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success/20 text-success ring-1 ring-success/30"
        aria-hidden
      >
        <CheckIcon className="size-3.5" />
      </span>
    );
  }
  return <span className="size-6 shrink-0 rounded-full border-2 border-muted-foreground/30 bg-background" aria-hidden />;
}

function ModuleTrackSteps({ row }: { row: CourseProgressModuleRow }) {
  const { requirements: req, progress: p } = row;
  const locked = !row.unlocked;

  const steps: { key: string; label: string; done: boolean }[] = [];

  if (req.lessonRequired || req.videoRequired) {
    const lessonOk = !req.lessonRequired || Boolean(p?.lessonCompleted);
    const videoOk = !req.videoRequired || Boolean(p?.videoCompleted);
    const label = req.videoRequired && req.lessonRequired ? "Лекция и видео" : req.videoRequired ? "Видео к лекции" : "Лекция";
    steps.push({ key: "prep", label, done: lessonOk && videoOk });
  }
  if (req.testRequired) {
    steps.push({ key: "test", label: "Тест", done: Boolean(p?.testCompleted) });
  }
  if (req.practiceRequired) {
    steps.push({ key: "practice", label: "Практика", done: Boolean(p?.practiceCompleted) });
  }

  if (steps.length === 0) {
    return <p className="text-xs text-muted-foreground">В модуле нет пошагового трека.</p>;
  }

  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4" aria-label="Шаги модуля">
      {steps.map((s) => (
        <li
          key={s.key}
          className={cn(
            "flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-xs shadow-sm",
            "border-border/70 bg-linear-to-br from-muted/25 to-card/90",
            locked && "border-dashed border-muted-foreground/35 bg-muted/40 opacity-90",
            !locked && s.done && "border-success/35 bg-success/10 ring-1 ring-inset ring-success/15",
            !locked && !s.done && row.unlocked && "border-sky-500/30 bg-sky-500/8 ring-1 ring-inset ring-sky-500/10",
          )}
        >
          <StepIcon locked={locked} done={s.done} />
          <span className={cn("font-semibold", locked ? "text-muted-foreground" : "text-foreground")}>{s.label}</span>
        </li>
      ))}
    </ul>
  );
}

function TrajectoryNode({ row, isLast }: { row: CourseProgressModuleRow; isLast: boolean }) {
  const status = getUiStatus(row);
  const ring =
    status === "completed"
      ? "border-success/50 bg-success/15 text-success"
      : status === "in_progress"
        ? "border-sky-500/55 bg-sky-500/12 text-sky-800"
        : status === "available"
          ? "border-primary/50 bg-primary/10 text-primary"
          : "border-muted-foreground/35 bg-muted/50 text-muted-foreground";

  return (
    <div className="flex min-w-0 flex-1 items-center">
      <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
        <div
          className={cn(
            "relative flex size-11 shrink-0 items-center justify-center rounded-2xl border-2 text-sm font-bold tabular-nums shadow-sm sm:size-12 sm:text-base",
            ring,
          )}
          title={row.module.title}
        >
          {status === "locked" ? <LockIcon className="size-4" /> : <span>{row.module.orderNumber}</span>}
          {status === "completed" ? (
            <span
              className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-success text-white shadow ring-1 ring-success/40"
              aria-hidden
            >
              <CheckIcon className="size-3 text-white" />
            </span>
          ) : null}
          {status === "in_progress" ? (
            <span className="absolute -bottom-0.5 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-sky-500/80" aria-hidden />
          ) : null}
          {status === "available" ? (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-card text-primary shadow ring-1 ring-border" aria-hidden>
              <PlayIcon className="size-2.5" />
            </span>
          ) : null}
        </div>
        <span className="max-w-[4.5rem] truncate text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:max-w-[6rem] sm:text-[11px]">
          М{row.module.orderNumber}
        </span>
        <Badge variant={statusBadge[status].variant} className={cn("px-1.5 py-0 text-[9px] sm:text-[10px]", statusBadge[status].className)}>
          {statusBadge[status].label}
        </Badge>
      </div>
      {!isLast ? (
        <div
          className={cn(
            "mx-0.5 h-0.5 min-w-[6px] flex-1 rounded-full sm:mx-1",
            row.moduleCompleted ? "bg-success/35" : row.unlocked ? "bg-primary/25" : "bg-border",
          )}
          aria-hidden
        />
      ) : null}
    </div>
  );
}

function CourseModuleTrajectoryCompact({ modules }: { modules: CourseProgressModuleRow[] }) {
  if (modules.length === 0) return null;
  return (
    <ol className="space-y-2" aria-label="Траектория модулей (компактно)">
      {modules.map((row) => {
        const status = getUiStatus(row);
        return (
          <li
            key={row.module.id}
            className={cn(
              "flex min-w-0 items-center gap-3 rounded-xl border px-3 py-3 shadow-sm",
              "border-border/70 bg-linear-to-r from-muted/20 to-card/95",
              status === "locked" && "border-dashed border-muted-foreground/35 bg-muted/35 opacity-95",
              status === "completed" && "border-success/35 bg-success/8 ring-1 ring-inset ring-success/10",
              status === "in_progress" && "border-sky-500/35 bg-sky-500/8 ring-1 ring-inset ring-sky-500/12",
              status === "available" && "border-primary/30 bg-primary/[0.04]",
            )}
          >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border-2 text-sm font-bold tabular-nums shadow-sm">
              {status === "locked" ? (
                <LockIcon className="size-4 text-muted-foreground" />
              ) : (
                <span className="text-foreground">{row.module.orderNumber}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{row.module.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge variant={statusBadge[status].variant} className={cn("text-[10px]", statusBadge[status].className)}>
                  {statusBadge[status].label}
                </Badge>
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Модуль {row.module.orderNumber}
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function CourseModuleTrajectory({ modules }: { modules: CourseProgressModuleRow[] }) {
  if (modules.length === 0) {
    return <p className="text-sm text-muted-foreground">Модули появятся после настройки курса.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border-2 border-border/70 bg-card/95 p-4 shadow-(--shadow-card) backdrop-blur-sm md:hidden">
        <p className="mb-3 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Learning path
        </p>
        <CourseModuleTrajectoryCompact modules={modules} />
      </div>

      <div className="hidden rounded-2xl border-2 border-border/70 bg-card/95 p-4 shadow-(--shadow-card) backdrop-blur-sm sm:p-5 md:block">
        <p className="mb-3 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Learning path</p>
        <div className="overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
          <div className="flex min-w-min items-center px-1">
            {modules.map((row, index) => (
              <TrajectoryNode key={row.module.id} row={row} isLast={index === modules.length - 1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SkillsFromCompleted({ modules }: { modules: CourseProgressModuleRow[] }) {
  const done = modules.filter((m) => m.moduleCompleted);
  if (done.length === 0) return null;

  return (
    <section className="rounded-2xl border-2 border-primary/20 bg-linear-to-br from-primary/6 via-card to-cyan/5 p-6 shadow-(--shadow-card) ring-1 ring-secondary/5 sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge variant="primary" className="mb-2 uppercase tracking-wider">
            Прогресс
          </Badge>
          <h2 className="typo-h2">Что вы уже умеете</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Завершённые модули закрепляют базовые темы: вы прошли материалы, тесты и практику по каждому блоку ниже.
          </p>
        </div>
      </div>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {done.map((m) => (
          <li
            key={m.module.id}
            className="flex gap-3 rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm ring-1 ring-inset ring-white/50"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-success/15 text-success ring-1 ring-success/25">
              <CheckIcon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Модуль {m.module.orderNumber}</p>
              <p className="mt-0.5 font-medium leading-snug text-foreground">{m.module.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Зачёт по модулю: <span className="font-semibold tabular-nums text-foreground">{m.score}</span> баллов.
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function NextStepBlock({ data }: { data: UserCourseProgressResult }) {
  const focus = currentFocusModule(data);
  const allDone = data.modules.length > 0 && data.modules.every((m) => m.moduleCompleted);
  const cta = continueLearningCta(data);

  const title = "Следующий шаг";
  let body: string;
  if (allDone) {
    body = "Оформите сертификат и при желании пройдите материалы модулей ещё раз для повторения.";
  } else if (focus) {
    body = `Продолжите с модуля ${focus.module.orderNumber}: пройдите оставшиеся шаги (лекция, тест или практика), чтобы открыть следующий блок.`;
  } else {
    body = "Откройте первый доступный модуль в списке карточек и начните с лекции.";
  }

  return (
    <section className="rounded-2xl border-2 border-border/80 bg-linear-to-br from-secondary/6 via-card to-muted/25 p-6 shadow-(--shadow-card) ring-1 ring-secondary/8 sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{body}</p>
          {!allDone && focus ? <p className="mt-2 text-xs font-medium text-foreground/90">{cta.hint}</p> : null}
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
          <Button variant="primary" className="w-full sm:w-auto lg:min-w-[220px]" asChild>
            <Link href={cta.href}>Продолжить обучение</Link>
          </Button>
          {allDone ? (
            <Button variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/dashboard/profile">Профиль и достижения</Link>
            </Button>
          ) : (
            <Button variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/dashboard/certificate">Сертификат</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

function ModulePathCard({ row }: { row: CourseProgressModuleRow }) {
  const status = getUiStatus(row);
  const badge = statusBadge[status];
  const action = getModuleAction(row);
  const desc = row.module.description?.trim() || "Описание модуля можно дополнить в админ-панели.";
  const diff = moduleDifficultyLabel(row.requirements);
  const time = moduleTimeEstimate(row.requirements);

  return (
    <Card
      className={cn(
        "relative flex h-full w-full min-w-0 max-w-full flex-col overflow-hidden shadow-card transition-all duration-300",
        status === "locked" && "border-muted-foreground/30 bg-muted/40 opacity-[0.97]",
        status === "available" && "border-success/35 bg-linear-to-br from-card via-emerald-500/[0.04] to-card ring-1 ring-inset ring-success/10",
        status === "in_progress" && "border-sky-500/40 bg-linear-to-br from-card via-sky-500/[0.06] to-card ring-1 ring-inset ring-sky-500/15",
        status === "completed" && "border-success/40 bg-linear-to-br from-success/[0.07] via-card to-card ring-1 ring-inset ring-success/15",
      )}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1",
          status === "locked" && "bg-muted-foreground/25",
          status === "available" && "bg-linear-to-r from-success via-emerald-400 to-success/70",
          status === "in_progress" && "bg-linear-to-r from-sky-500 via-primary to-sky-400",
          status === "completed" && "bg-linear-to-r from-success via-emerald-300 to-success",
        )}
        aria-hidden
      />
      <CardHeader className="space-y-3 pb-2 pt-4 sm:pt-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-muted/40 text-muted-foreground sm:size-10">
              <BookIcon className="size-4 sm:size-[1.125rem]" />
            </span>
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Модуль {row.module.orderNumber}</p>
              <CardTitle className="text-base leading-snug text-foreground sm:text-lg">{row.module.title}</CardTitle>
            </div>
          </div>
          <Badge variant={badge.variant} className={cn("shrink-0 gap-1", badge.className)}>
            {status === "locked" ? <LockIcon className="size-3.5 opacity-80" /> : null}
            {status === "completed" ? <CheckIcon className="size-3.5" /> : null}
            {badge.label}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="font-normal text-muted-foreground">
            Сложность: <span className="font-medium text-foreground">{diff}</span>
          </Badge>
          <Badge variant="outline" className="font-normal tabular-nums text-muted-foreground">
            Время: <span className="font-medium text-foreground">{time}</span>
          </Badge>
        </div>
        <CardDescription className="text-sm leading-relaxed text-pretty text-muted-foreground">{desc}</CardDescription>
        {status === "locked" ? (
          <p className="flex items-start gap-2 rounded-lg border border-dashed border-muted-foreground/35 bg-background/80 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            <LockIcon className="mt-0.5 shrink-0 opacity-70" />
            <span>Завершите предыдущий модуль, чтобы открыть этот.</span>
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 pt-0">
        <div className="space-y-2">
          <div className="flex items-end justify-between gap-2 text-xs">
            <span className="font-semibold uppercase tracking-wide text-muted-foreground">Прогресс модуля</span>
            <span className="tabular-nums text-sm font-semibold text-foreground">{row.unlocked ? row.progressPercent : 0}%</span>
          </div>
          <ProgressBar
            value={row.unlocked ? row.progressPercent : 0}
            max={100}
            tone={status === "completed" ? "success" : status === "available" ? "success" : "default"}
            label={row.unlocked ? "Шаги модуля" : "Модуль закрыт"}
          />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Шаги и статусы</p>
          <ModuleTrackSteps row={row} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-sm">
          <Badge variant="outline" className="font-normal tabular-nums">
            Баллы: <span className="font-semibold text-foreground">{row.score}</span>
          </Badge>
        </div>
      </CardContent>
      <div className="mt-auto border-t border-border/60 bg-linear-to-r from-muted/20 via-card to-muted/15 px-4 py-3.5 sm:px-6 sm:py-4">
        {action.disabled ? (
          <Button className="inline-flex w-full items-center justify-center gap-2 text-xs sm:text-sm" variant="outline" type="button" disabled>
            <LockIcon className="size-4 shrink-0 opacity-70" />
            <span className="text-left leading-snug">{action.label}</span>
          </Button>
        ) : (
          <Button className="w-full" variant={status === "completed" ? "outline" : "primary"} asChild>
            <Link href={action.href}>{action.label}</Link>
          </Button>
        )}
      </div>
    </Card>
  );
}

export function CourseLearningPath({ data }: { data: UserCourseProgressResult }) {
  const modules = data.modules;
  const doneCount = modules.filter((m) => m.moduleCompleted).length;
  const totalCount = modules.length;
  const ringTone = data.overallProgressPercent >= 100 ? "success" : doneCount > 0 ? "cyan" : "default";
  const focus = currentFocusModule(data);
  const cta = continueLearningCta(data);
  const allDone = totalCount > 0 && doneCount === totalCount;

  return (
    <div className="space-y-7 lg:space-y-9">
      {/* Герой курса — тот же визуальный язык, что и профиль (рамка, сетка, акцент слева) */}
      <section className="ce-user-profile-hero p-5 sm:p-7 lg:p-8">
        <div className="ce-user-profile-hero-blob" aria-hidden />
        <div className="ce-user-profile-hero-grid" aria-hidden />
        <div className="ce-user-profile-hero-vignette" aria-hidden />

        <div className="relative z-10 grid gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,36%)] lg:items-stretch lg:gap-7 xl:grid-cols-[minmax(0,1fr)_minmax(300px,34%)] xl:gap-8 2xl:grid-cols-[minmax(0,1fr)_minmax(320px,32%)]">
          <div className="flex min-w-0 flex-col gap-4">
            <Badge variant="primary" className="w-fit uppercase tracking-wider shadow-sm">
              Ваш курс
            </Badge>
            <h1 className="text-balance text-2xl font-semibold tracking-tighter text-foreground sm:text-3xl lg:text-[2rem] lg:leading-tight">
              {data.course.title}
            </h1>
            {data.course.description ? (
              <p className="line-clamp-3 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">{data.course.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Описание курса появится позже.</p>
            )}

            <div className="rounded-2xl border-2 border-border/70 bg-card/90 p-4 shadow-(--shadow-card) backdrop-blur-sm sm:p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Текущий модуль</p>
              {focus ? (
                <>
                  <p className="mt-1 text-base font-semibold leading-snug text-foreground sm:text-lg">
                    {focus.module.orderNumber}. {focus.module.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Прогресс по шагам: <span className="font-semibold tabular-nums text-foreground">{focus.progressPercent}%</span>
                  </p>
                </>
              ) : allDone ? (
                <p className="mt-1 text-base font-semibold text-foreground">Все модули завершены</p>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">Начните с первого доступного модуля в траектории ниже.</p>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button variant="primary" className="w-full shadow-md sm:w-auto sm:min-w-[200px]" asChild>
                <Link href={cta.href}>Продолжить обучение</Link>
              </Button>
              <Button variant="outline" className="w-full border-primary/30 bg-card/90 backdrop-blur-sm sm:w-auto" asChild>
                <Link href="/dashboard/profile">Профиль</Link>
              </Button>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">{cta.hint}</p>
          </div>

          <aside className="flex min-w-0 flex-col justify-between gap-4 rounded-2xl border-2 border-primary/20 bg-linear-to-br from-card via-card to-primary/5 p-5 shadow-(--shadow-card) backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Общий прогресс</p>
                <p className="mt-0.5 text-3xl font-bold tabular-nums text-foreground sm:text-4xl">{data.overallProgressPercent}%</p>
              </div>
              <CircularProgress value={data.overallProgressPercent} tone={ringTone} size={88} strokeWidth={8} label="Доля завершённых модулей" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border/70 bg-background/60 px-3 py-2.5 shadow-inner">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Модули</p>
                <p className="mt-0.5 text-lg font-bold tabular-nums text-foreground">{totalCount === 0 ? "—" : `${doneCount}/${totalCount}`}</p>
                <p className="text-[10px] text-muted-foreground">завершено</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/60 px-3 py-2.5 shadow-inner">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Баллы</p>
                <p className="mt-0.5 text-lg font-bold tabular-nums text-foreground">{data.totalScore}</p>
                <p className="text-[10px] text-muted-foreground">по курсу</p>
              </div>
            </div>
            <div className="rounded-xl border border-primary/25 bg-primary/8 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Текущий статус</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">
                {allDone ? "Курс пройден" : focus ? "Учёба продолжается" : "Готовы начать"}
              </p>
            </div>
            <ProgressBar
              value={data.overallProgressPercent}
              max={100}
              label="Завершённые модули"
              tone={data.overallProgressPercent >= 100 ? "success" : "default"}
            />
          </aside>
        </div>
      </section>

      {/* Траектория */}
      <section className="space-y-4">
        <div>
          <Badge variant="outline" className="mb-2 uppercase tracking-wider">
            Learning path
          </Badge>
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">Траектория модулей</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Идите по порядку: каждый следующий модуль открывается после завершения предыдущего. Иконки показывают статус блока.
          </p>
        </div>
        <CourseModuleTrajectory modules={modules} />
      </section>

      {/* Карточки */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">Все модули</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          В каждой карточке — описание, оценка объёма по шагам, статусы лекции, теста и практики, баллы и действие.
        </p>
        <ResponsiveGrid>
          {modules.map((row) => (
            <ModulePathCard key={row.module.id} row={row} />
          ))}
        </ResponsiveGrid>
      </section>

      <SkillsFromCompleted modules={modules} />

      <NextStepBlock data={data} />
    </div>
  );
}
