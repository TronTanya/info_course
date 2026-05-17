import Link from "next/link";
import { CourseModuleCard } from "@/components/course/course-module-card";
import { CourseTrajectoryAnimated } from "@/components/course/course-trajectory-animated";
import type { CourseProgressModuleRow, UserCourseProgressResult } from "@/lib/progress";
import { getModuleAction } from "@/lib/course-path-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/ui/circular-progress";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { cn } from "@/lib/utils";

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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("size-4 shrink-0", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
    <section className="ce-learn-panel ce-border-beam ce-card-glow rounded-2xl border-2 border-border/80 bg-linear-to-br from-secondary/6 via-card to-muted/25 p-6 shadow-(--shadow-card) ring-1 ring-secondary/8 sm:p-8">
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
        <CourseTrajectoryAnimated modules={modules} />
      </section>

      {/* Карточки */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">Все модули</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          В каждой карточке — описание, оценка объёма по шагам, статусы лекции, теста и практики, баллы и действие.
        </p>
        <ResponsiveGrid>
          {modules.map((row, index) => (
            <CourseModuleCard key={row.module.id} row={row} index={index} />
          ))}
        </ResponsiveGrid>
      </section>

      <SkillsFromCompleted modules={modules} />

      <NextStepBlock data={data} />
    </div>
  );
}
