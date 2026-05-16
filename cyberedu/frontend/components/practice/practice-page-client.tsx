"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ComponentProps, type TransitionStartFunction } from "react";
import type { CheckType, PracticalTaskType, SubmissionStatus } from "@prisma/client";
import type { ProgressGate } from "@/lib/course-progress-guards";
import { AiMentorChat } from "@/components/ai/AiMentorChat";
import { PracticeLabLayout } from "@/components/layout/practice-lab-layout";
import { ScenarioPracticeBlock } from "@/components/practice/scenario-practice-forms";
import { PracticeSocraticHintPanel } from "@/components/practice/practice-socratic-hint";
import { TrainingConsole } from "@/components/practice/TrainingConsole";
import { submitPracticeTextAction, verifyPracticeInteractiveAction } from "@/lib/actions/practice";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionCard } from "@/components/ui/section-card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatRuDateTimeFullUtc } from "@/lib/datetime-stable";

export type ClientSubmission = {
  id: string;
  status: SubmissionStatus;
  textAnswer: string | null;
  fileDownloadUrl: string | null;
  score: number | null;
  adminComment: string | null;
  createdAt: string;
} | null;

export type ClientPracticalTask = {
  id: string;
  title: string;
  description: string;
  taskType: PracticalTaskType;
  checkType: CheckType;
  maxScore: number;
  minLength: number;
  instruction: string | null;
  /** INTERACTIVE / TRAINING_CONSOLE */
  consoleScenario: string | null;
  /** FILE_UPLOAD / COMBINED */
  fileAccept: string | null;
  fileTypesLabel: string | null;
  fileMaxMb: number | null;
  hasInteractiveAutoCheck: boolean;
  /** Только для INTERACTIVE / TRAINING_CONSOLE */
  interactiveMode: "structured" | "legacy" | "manual";
  expectedCommand: string | null;
  expectedAnswerPattern: string | null;
  scenarioData: unknown | null;
  latestSubmission: ClientSubmission;
};

export type PracticeLabModuleContext = {
  courseTitle: string;
  moduleOrderNumber: number;
  moduleTitle: string;
  moduleProgress: { percent: number; completed: number; total: number };
};

const SCENARIO_TASK_TYPES = new Set<PracticalTaskType>([
  "SITUATION_CHOICE",
  "PASSWORD_ANALYSIS",
  "PHISHING_ANALYSIS",
  "CHECKLIST",
  "URL_ANALYSIS",
  "CRYPTO_TASK",
  "LOG_ANALYSIS",
  "TRAINING_CONSOLE",
]);

function taskTypeRu(t: PracticalTaskType): string {
  const m: Record<PracticalTaskType, string> = {
    TEXT_ANSWER: "Текстовый ответ",
    FILE_UPLOAD: "Загрузка файла",
    INTERACTIVE: "Интерактивная проверка",
    COMBINED: "Комбинированное задание",
    SITUATION_CHOICE: "Ситуации и выбор",
    PASSWORD_ANALYSIS: "Анализ паролей",
    PHISHING_ANALYSIS: "Разбор фишинга",
    CHECKLIST: "Чек-лист",
    URL_ANALYSIS: "Анализ ссылок",
    TRAINING_CONSOLE: "Учебная консоль (симулятор)",
    CRYPTO_TASK: "Криптография (учебно)",
    LOG_ANALYSIS: "Анализ журнала",
  };
  return m[t] ?? t;
}

/** Подпись типа задания для лаборатории (как в ТЗ). */
function taskLabComponentLabel(t: PracticalTaskType): { en: string; ru: string } {
  const m: Record<PracticalTaskType, { en: string; ru: string }> = {
    SITUATION_CHOICE: { en: "SituationChoiceTask", ru: "Ситуации и выбор" },
    PHISHING_ANALYSIS: { en: "PhishingEmailTask", ru: "Разбор фишинга" },
    URL_ANALYSIS: { en: "UrlAnalysisTask", ru: "Анализ ссылок" },
    TRAINING_CONSOLE: { en: "TrainingConsoleTask", ru: "Учебная консоль" },
    CRYPTO_TASK: { en: "CryptoTask", ru: "Криптография" },
    LOG_ANALYSIS: { en: "LogAnalysisTask", ru: "Анализ журнала" },
    FILE_UPLOAD: { en: "FileUploadTask", ru: "Загрузка файла" },
    TEXT_ANSWER: { en: "TextAnswerTask", ru: "Текстовый ответ" },
    INTERACTIVE: { en: "TrainingConsoleTask", ru: "Интерактив" },
    COMBINED: { en: "TextAnswerTask + FileUploadTask", ru: "Комбинированное" },
    PASSWORD_ANALYSIS: { en: "SituationChoiceTask", ru: "Анализ паролей" },
    CHECKLIST: { en: "SituationChoiceTask", ru: "Чек-лист" },
  };
  return m[t] ?? { en: "PracticeTask", ru: taskTypeRu(t) };
}

function checkTypeRu(c: CheckType): string {
  const m: Record<CheckType, string> = {
    AUTO: "Автопроверка",
    MANUAL: "Ручная проверка",
    MIXED: "Смешанная проверка",
  };
  return m[c] ?? c;
}

function statusRu(s: SubmissionStatus): string {
  const m: Record<SubmissionStatus, string> = {
    DRAFT: "Черновик",
    SUBMITTED: "Отправлено",
    CHECKING: "На проверке",
    ACCEPTED: "Принято",
    REJECTED: "Отклонено",
    NEEDS_REVISION: "Нужны правки",
  };
  return m[s] ?? s;
}

function statusBadgeVariant(s: SubmissionStatus): NonNullable<ComponentProps<typeof Badge>["variant"]> {
  switch (s) {
    case "ACCEPTED":
      return "success";
    case "REJECTED":
      return "danger";
    case "NEEDS_REVISION":
      return "warning";
    case "SUBMITTED":
    case "CHECKING":
      return "cyan";
    case "DRAFT":
    default:
      return "secondary";
  }
}

function submissionStatusLabel(sub: ClientSubmission): string {
  if (!sub) return "Не отправлено";
  if (sub.status === "SUBMITTED" || sub.status === "CHECKING") return "На проверке";
  return statusRu(sub.status);
}

function passingScoreHint(task: ClientPracticalTask): string {
  if (task.maxScore <= 0) return "Баллы не настроены для этого задания.";
  if (task.checkType === "AUTO" && task.hasInteractiveAutoCheck) {
    return `При успешной автопроверке начисляется до ${task.maxScore} баллов.`;
  }
  if (task.checkType === "AUTO") {
    return `Максимум ${task.maxScore} баллов. Ориентир для зачёта — уточняйте у преподавателя.`;
  }
  return `Максимум ${task.maxScore} баллов. Проходной порог и критерии зачёта определяет проверяющий.`;
}

function criteriaBullets(task: ClientPracticalTask): string[] {
  const lines: string[] = [];
  lines.push(`Тип проверки: ${checkTypeRu(task.checkType)}.`);
  lines.push(`Формат задания: ${taskTypeRu(task.taskType)}.`);
  if (task.taskType === "TEXT_ANSWER" || task.taskType === "COMBINED") {
    lines.push(`Текст: не менее ${task.minLength} символов.`);
  }
  if (task.taskType === "FILE_UPLOAD" || task.taskType === "COMBINED") {
    lines.push(
      `Файл: ${task.fileTypesLabel ?? "разрешённые форматы"}, до ${task.fileMaxMb ?? 10} МБ; исполняемые файлы не принимаются.`,
    );
  }
  if (task.taskType === "INTERACTIVE" || task.taskType === "TRAINING_CONSOLE") {
    if (task.hasInteractiveAutoCheck) {
      lines.push("Есть автоматическая проверка учебных действий в симуляторе.");
    } else {
      lines.push("Ответ проверяется вручную по вашему описанию или отчёту.");
    }
  }
  if (SCENARIO_TASK_TYPES.has(task.taskType)) {
    lines.push("Сценарий учебный: безопасные демо-данные, без реальных атак.");
  }
  return lines;
}

function feedbackSummary(sub: NonNullable<ClientSubmission>, maxScore: number): string {
  switch (sub.status) {
    case "ACCEPTED":
      return sub.score != null ? `Зачёт: ${sub.score} из ${maxScore} баллов.` : "Работа принята.";
    case "REJECTED":
      return "Работа не принята. Ознакомьтесь с комментарием проверяющего.";
    case "NEEDS_REVISION":
      return "Требуется доработка. Исправьте замечания и отправьте снова.";
    case "SUBMITTED":
    case "CHECKING":
      return "Отправление получено и ожидает проверки преподавателем.";
    default:
      return "";
  }
}

export type PracticePageClientProps = {
  moduleId: string;
  moduleTitle: string;
  labContext: PracticeLabModuleContext;
  practiceGate: ProgressGate;
  tasks: ClientPracticalTask[];
};

function practiceBlockedCta(code: string, moduleId: string): { href: string; label: string } | null {
  switch (code) {
    case "TEST":
      return { href: `/dashboard/course/${moduleId}/test`, label: "Перейти к тесту" };
    case "LESSON":
    case "VIDEO":
      return { href: `/dashboard/course/${moduleId}/lesson`, label: "Перейти к лекции" };
    case "MODULE_LOCKED":
    case "MODULE_INACTIVE":
      return { href: "/dashboard/course", label: "К списку модулей" };
    default:
      return null;
  }
}

export function PracticePageClient({ moduleId, moduleTitle, labContext, practiceGate, tasks }: PracticePageClientProps) {
  const chatTaskId = tasks.length === 1 ? tasks[0].id : null;
  const [chatOpenSeq, setChatOpenSeq] = useState(0);

  if (!practiceGate.ok) {
    const cta = practiceBlockedCta(practiceGate.code, moduleId);
    return (
      <SectionCard variant="muted" className="p-6 sm:p-8">
        <h2 className="typo-h3">Практика недоступна</h2>
        <p className="typo-body-muted mt-2">{practiceGate.message}</p>
        {cta ? (
          <Button asChild variant="primary" className="mt-6 w-full sm:w-auto">
            <Link href={cta.href}>{cta.label}</Link>
          </Button>
        ) : null}
        <AiMentorChat moduleId={moduleId} openSignal={chatOpenSeq} />
      </SectionCard>
    );
  }

  if (tasks.length === 0) {
    return (
      <SectionCard className="p-8 text-center">
        <p className="typo-body-muted">Для этого модуля пока нет практических заданий.</p>
        <Button asChild variant="outline" className="mt-6 w-full sm:w-auto">
          <Link href={`/dashboard/course/${moduleId}`}>К модулю</Link>
        </Button>
        <AiMentorChat moduleId={moduleId} openSignal={chatOpenSeq} />
      </SectionCard>
    );
  }

  return (
    <div className="space-y-8">
      {tasks.map((task) => (
        <PracticeLabSession
          key={task.id}
          moduleId={moduleId}
          moduleTitle={moduleTitle}
          labContext={labContext}
          task={task}
          onOpenAiChat={() => setChatOpenSeq((n) => n + 1)}
        />
      ))}
      <AiMentorChat moduleId={moduleId} practicalTaskId={chatTaskId ?? undefined} openSignal={chatOpenSeq} />
    </div>
  );
}

function PracticeLabSession({
  moduleId,
  moduleTitle,
  labContext,
  task,
  onOpenAiChat,
}: {
  moduleId: string;
  moduleTitle: string;
  labContext: PracticeLabModuleContext;
  task: ClientPracticalTask;
  onOpenAiChat: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const sub = task.latestSubmission;
  const pendingReview = Boolean(sub && (sub.status === "SUBMITTED" || sub.status === "CHECKING"));
  const needsRevision = sub?.status === "NEEDS_REVISION";
  const accepted = sub?.status === "ACCEPTED";
  const goalBody = task.instruction?.trim() || null;
  const lab = taskLabComponentLabel(task.taskType);

  function onMessage(err: string | null, ok: string | null) {
    setError(err);
    setInfo(ok);
    if (ok && !err) {
      router.refresh();
    }
  }

  const latestForScenario = sub ? { status: sub.status, adminComment: sub.adminComment } : null;
  const { moduleProgress } = labContext;

  const breadcrumb = (
    <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium" aria-label="Навигация по курсу">
      <Link href="/dashboard/course" className="text-primary hover:underline">
        Курс
      </Link>
      <span aria-hidden className="text-muted-foreground/40">
        /
      </span>
      <Link href={`/dashboard/course/${moduleId}`} className="text-primary hover:underline">
        Модуль {labContext.moduleOrderNumber}
      </Link>
      <span aria-hidden className="text-muted-foreground/40">
        /
      </span>
      <span className="text-foreground">Практика</span>
    </nav>
  );

  const header = (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0 space-y-2">
        <p className="typo-eyebrow text-primary">Учебная лаборатория</p>
        <h1 className="typo-h1 text-balance">{task.title}</h1>
        <p className="typo-body-muted">
          <span className="font-medium text-foreground">Модуль:</span> {moduleTitle}
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:flex-col lg:items-stretch">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-border bg-card font-normal text-foreground">
            {submissionStatusLabel(sub)}
          </Badge>
          <Badge variant="secondary" className="font-normal">
            Макс. {task.maxScore} б.
          </Badge>
        </div>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href={`/dashboard/course/${moduleId}`}>К модулю</Link>
        </Button>
      </div>
    </div>
  );

  const main = (
    <div className="space-y-6">
      {needsRevision ? (
        <Alert variant="warning" title="Работа на доработке">
          {sub?.adminComment?.trim() ? (
            <span className="text-pretty">{sub.adminComment.trim()}</span>
          ) : (
            <span>Учтите замечания проверяющего и отправьте работу снова.</span>
          )}
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="danger" title="Ошибка">
          {error}
        </Alert>
      ) : null}
      {info ? (
        <Alert variant="success" title="Готово">
          {info}
        </Alert>
      ) : null}

      {!sub && !pendingReview && !accepted ? (
        <Alert variant="info" title="Как сдать практику" hideIcon={false}>
          Выполните задание в рабочей области ниже и отправьте ответ или файлы — в зависимости от типа задания.
        </Alert>
      ) : null}

      {accepted ? (
        <Alert variant="success" title="Практика принята">
          Следующий шаг модуля доступен. Вернитесь к модулю, чтобы продолжить программу.
        </Alert>
      ) : null}

      <SectionCard title="Цель задания">
        <div className="typo-body-muted text-pretty">
          {goalBody ? (
            <p className="whitespace-pre-wrap">{goalBody}</p>
          ) : (
            <p>
              Закрепить навык «{taskTypeRu(task.taskType)}»: внимательно прочитайте условие и выполните шаги в рабочей области.
            </p>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Условие">
        <div className="space-y-2 text-pretty typo-body-muted">
          {task.description.split("\n").map((line, i) => (
            <p key={i} className="whitespace-pre-wrap">
              {line}
            </p>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        variant="workspace"
        title="Рабочая область"
        description={
          <>
            Компонент: <span className="font-mono text-foreground">{lab.en}</span> · {lab.ru}
          </>
        }
      >
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Badge variant="outline" className="w-fit font-normal">
            {taskTypeRu(task.taskType)}
          </Badge>
        </div>
        <p className="typo-caption mb-6 border-b border-border/60 pb-4">
          Симуляторы и формы учебные: команды не выполняются на реальной ОС; вредоносные действия не требуются.
        </p>
        <div className="space-y-4">
          {task.taskType === "TEXT_ANSWER" ? (
            <TextAnswerForm
              moduleId={moduleId}
              taskId={task.id}
              minLength={task.minLength}
              startTransition={startTransition}
              pending={pending}
              submitBlocked={pendingReview}
              onMessage={onMessage}
            />
          ) : null}

          {task.taskType === "FILE_UPLOAD" ? (
            <FileUploadForm
              moduleId={moduleId}
              taskId={task.id}
              accept={task.fileAccept ?? ""}
              typesLabel={task.fileTypesLabel ?? ""}
              maxMb={task.fileMaxMb ?? 10}
              startTransition={startTransition}
              pending={pending}
              submitBlocked={pendingReview}
              onMessage={onMessage}
            />
          ) : null}

          {task.taskType === "INTERACTIVE" ? (
            <InteractiveForm
              moduleId={moduleId}
              taskId={task.id}
              mode={task.interactiveMode}
              consoleScenario={task.consoleScenario}
              expectedCommand={task.expectedCommand}
              expectedAnswerPattern={task.expectedAnswerPattern}
              hasAuto={task.hasInteractiveAutoCheck}
              minLength={task.minLength}
              accepted={accepted}
              submitBlocked={pendingReview}
              startTransition={startTransition}
              pending={pending}
              onMessage={onMessage}
            />
          ) : null}

          {task.taskType === "COMBINED" ? (
            <CombinedForm
              moduleId={moduleId}
              taskId={task.id}
              minLength={task.minLength}
              accept={task.fileAccept ?? ""}
              typesLabel={task.fileTypesLabel ?? ""}
              maxMb={task.fileMaxMb ?? 10}
              startTransition={startTransition}
              pending={pending}
              submitBlocked={pendingReview}
              onMessage={onMessage}
            />
          ) : null}

          {SCENARIO_TASK_TYPES.has(task.taskType) ? (
            <ScenarioPracticeBlock
              moduleId={moduleId}
              taskId={task.id}
              taskType={task.taskType}
              scenarioData={task.scenarioData}
              latestSubmission={latestForScenario}
              startTransition={startTransition}
              pending={pending}
              onMessage={onMessage}
              console={
                task.taskType === "TRAINING_CONSOLE"
                  ? {
                      consoleScenario: task.consoleScenario,
                      expectedCommand: task.expectedCommand,
                      expectedAnswerPattern: task.expectedAnswerPattern,
                      minLength: task.minLength,
                    }
                  : null
              }
            />
          ) : null}
        </div>
      </SectionCard>

      {sub ? (
        <SectionCard title="Последняя отправка">
          <p className="typo-body-muted">{feedbackSummary(sub, task.maxScore)}</p>
          {sub.adminComment?.trim() ? (
            <p className="typo-body-muted mt-3 rounded-xl border border-border bg-muted/40 p-3">
              <span className="font-medium text-foreground">Комментарий: </span>
              {sub.adminComment.trim()}
            </p>
          ) : null}
          {sub.fileDownloadUrl ? (
            <p className="mt-3">
              <a className="font-medium text-primary underline-offset-4 hover:underline" href={sub.fileDownloadUrl}>
                Скачать прикреплённый файл
              </a>
            </p>
          ) : null}
          <p className="typo-caption mt-2">Отправка: {formatRuDateTimeFullUtc(sub.createdAt)}</p>
        </SectionCard>
      ) : null}
    </div>
  );

  const aside = (
    <div className="space-y-5">
      <SectionCard title="Статус">
        <div className="flex items-center gap-2">
          <Badge variant={sub ? statusBadgeVariant(sub.status) : "secondary"} className="text-xs">
            {submissionStatusLabel(sub)}
          </Badge>
        </div>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="typo-label">Текущий балл</dt>
            <dd className="mt-1 font-semibold tabular-nums text-foreground">
              {sub?.score != null ? `${sub.score} / ${task.maxScore}` : "—"}
            </dd>
          </div>
          <div>
            <dt className="typo-label">Проходной балл</dt>
            <dd className="typo-body-muted mt-1 leading-snug">{passingScoreHint(task)}</dd>
          </div>
        </dl>
      </SectionCard>

      <SectionCard title="Критерии">
        <ul className="list-disc space-y-2 pl-4 typo-body-muted">
          {criteriaBullets(task).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard variant="accent" title="Нужна подсказка?" description="AI-наставник задаёт наводящие вопросы по заданию (без готовых ответов на практику).">
        <PracticeSocraticHintPanel moduleId={moduleId} practicalTaskId={task.id} className="border-0 bg-transparent p-0 shadow-none" />
        <Button type="button" variant="primary" className="mt-4 w-full" onClick={onOpenAiChat}>
          Открыть AI-чат
        </Button>
      </SectionCard>

      <SectionCard title="Прогресс модуля">
        <p className="typo-caption">Шаги: {moduleProgress.completed} из {moduleProgress.total}</p>
        <ProgressBar
          className="mt-3"
          value={moduleProgress.percent}
          max={100}
          label={`Прогресс модуля: ${moduleProgress.percent}%`}
          tone={moduleProgress.percent >= 100 ? "success" : "default"}
        />
      </SectionCard>

      <SectionCard title="Что дальше">
        <ul className="space-y-2 typo-body-muted">
          {!accepted && !pendingReview ? <li>Завершите задание в рабочей области и отправьте ответ.</li> : null}
          {pendingReview ? <li>Дождитесь проверки преподавателя.</li> : null}
          {needsRevision ? <li>Внесите правки и отправьте работу повторно.</li> : null}
          {accepted ? (
            <li>
              <Link href={`/dashboard/course/${moduleId}`} className="font-medium text-primary hover:underline">
                Вернуться к модулю
              </Link>{" "}
              и перейдите к следующему шагу (тест или итог модуля).
            </li>
          ) : null}
          {!accepted ? (
            <li>
              <Link href={`/dashboard/course/${moduleId}/lesson`} className="text-primary hover:underline">
                Лекция модуля
              </Link>
              {" · "}
              <Link href={`/dashboard/course/${moduleId}/test`} className="text-primary hover:underline">
                Тест
              </Link>
            </li>
          ) : null}
        </ul>
      </SectionCard>
    </div>
  );

  return <PracticeLabLayout breadcrumb={breadcrumb} header={header} main={main} aside={aside} />;
}

function TextAnswerForm({
  moduleId,
  taskId,
  minLength,
  startTransition,
  pending,
  submitBlocked,
  onMessage,
}: {
  moduleId: string;
  taskId: string;
  minLength: number;
  startTransition: TransitionStartFunction;
  pending: boolean;
  submitBlocked: boolean;
  onMessage: (err: string | null, ok: string | null) => void;
}) {
  const [text, setText] = useState("");
  const okLen = text.trim().length >= minLength;
  if (submitBlocked) {
    return (
      <div className="rounded-xl border border-cyan-100 bg-cyan-50/80 px-4 py-3 text-sm text-slate-600">
        Эта отправка ожидает проверки. Новая станет доступна после решения преподавателя.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <Textarea
        label="Ваш ответ"
        hint={`Не менее ${minLength} символов.`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        className="min-h-[180px] border-slate-200 bg-white"
      />
      <Button
        type="button"
        className="w-full sm:w-auto"
        loading={pending}
        disabled={!okLen}
        onClick={() => {
          onMessage(null, null);
          startTransition(async () => {
            const res = await submitPracticeTextAction({ moduleId, practicalTaskId: taskId, text });
            if (res.error) onMessage(res.error, null);
            else onMessage(null, "Работа отправлена на проверку.");
          });
        }}
      >
        Отправить на проверку
      </Button>
    </div>
  );
}

function FileUploadForm({
  moduleId,
  taskId,
  accept,
  typesLabel,
  maxMb,
  startTransition,
  pending,
  submitBlocked,
  onMessage,
}: {
  moduleId: string;
  taskId: string;
  accept: string;
  typesLabel: string;
  maxMb: number;
  startTransition: TransitionStartFunction;
  pending: boolean;
  submitBlocked: boolean;
  onMessage: (err: string | null, ok: string | null) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  if (submitBlocked) {
    return (
      <div className="rounded-xl border border-cyan-100 bg-cyan-50/80 px-4 py-3 text-sm text-slate-600">
        Файл уже отправлен и ожидает проверки.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-600">
        Форматы: {typesLabel}. До {maxMb} МБ. Исполняемые файлы не принимаются.
      </p>
      <input
        type="file"
        accept={accept || undefined}
        className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <Button
        type="button"
        className="w-full sm:w-auto"
        loading={pending}
        disabled={!file}
        onClick={() => {
          if (!file) return;
          onMessage(null, null);
          startTransition(async () => {
            const fd = new FormData();
            fd.set("moduleId", moduleId);
            fd.set("practicalTaskId", taskId);
            fd.set("file", file);
            const res = await fetch("/api/practice/upload-file", { method: "POST", body: fd });
            const data = (await res.json()) as { ok?: boolean; error?: string };
            if (!res.ok || !data.ok) {
              onMessage(data.error || "Ошибка загрузки", null);
              return;
            }
            onMessage(null, "Файл успешно отправлен.");
            setFile(null);
          });
        }}
      >
        Загрузить и отправить
      </Button>
    </div>
  );
}

function InteractiveForm({
  moduleId,
  taskId,
  mode,
  consoleScenario,
  expectedCommand,
  expectedAnswerPattern,
  hasAuto,
  minLength,
  accepted,
  submitBlocked,
  startTransition,
  pending,
  onMessage,
}: {
  moduleId: string;
  taskId: string;
  mode: "structured" | "legacy" | "manual";
  consoleScenario: string | null;
  expectedCommand: string | null;
  expectedAnswerPattern: string | null;
  hasAuto: boolean;
  minLength: number;
  accepted: boolean;
  submitBlocked: boolean;
  startTransition: TransitionStartFunction;
  pending: boolean;
  onMessage: (err: string | null, ok: string | null) => void;
}) {
  const [legacyAnswer, setLegacyAnswer] = useState("");
  const [manualNote, setManualNote] = useState("");

  if (accepted) {
    return <p className="text-sm text-slate-600">Задание выполнено.</p>;
  }

  if (submitBlocked) {
    return (
      <div className="rounded-xl border border-cyan-100 bg-cyan-50/80 px-4 py-3 text-sm text-slate-600">
        Ответ отправлен и ожидает проверки преподавателем.
      </div>
    );
  }

  const needsExplanation = Boolean(expectedAnswerPattern?.trim());
  const needsCommand = Boolean(expectedCommand?.trim());
  const ecNorm = expectedCommand?.trim() ?? "";

  const explanationMin = Math.max(12, minLength);

  return (
    <div className="space-y-4">
      {mode === "structured" ? (
        <TrainingConsole
          instructionBanner={consoleScenario}
          structuredPractice={{
            moduleId,
            practicalTaskId: taskId,
            expectedCommand: needsCommand ? ecNorm : null,
            expectedAnswerPattern: needsExplanation ? expectedAnswerPattern : null,
            minLength: explanationMin,
            onSubmitResult: (err, ok) => {
              if (err) onMessage(err, null);
              else onMessage(null, ok);
            },
          }}
        />
      ) : (
        <>
          {consoleScenario?.trim() ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 whitespace-pre-wrap">
              {consoleScenario.trim()}
            </div>
          ) : null}
          <p className="text-xs text-slate-500">
            Учебная консоль — симулятор: команды не выполняются на сервере и не вызывают реальную ОС.
          </p>
          <TrainingConsole />
          {mode === "legacy" ? (
            <div className="space-y-2">
              {!hasAuto ? (
                <p className="text-xs text-slate-500">Автопроверка не настроена — ответ уйдет на ручную проверку.</p>
              ) : null}
              <label className="block space-y-1 text-sm">
                <span className="font-medium text-slate-800">Кодовая фраза из задания</span>
                <input
                  className={cn(
                    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30",
                  )}
                  value={legacyAnswer}
                  onChange={(e) => setLegacyAnswer(e.target.value)}
                  autoComplete="off"
                />
              </label>
              <Button
                type="button"
                className="w-full sm:w-auto"
                loading={pending}
                disabled={!legacyAnswer.trim()}
                onClick={() => {
                  onMessage(null, null);
                  startTransition(async () => {
                    const res = await verifyPracticeInteractiveAction({
                      moduleId,
                      practicalTaskId: taskId,
                      answer: legacyAnswer,
                    });
                    if (res.error) onMessage(res.error, null);
                    else if (res.fallbackManual) onMessage(null, "Ответ отправлен на ручную проверку.");
                    else onMessage(null, "Верно! Задание засчитано автоматически.");
                  });
                }}
              >
                Проверить
              </Button>
            </div>
          ) : null}
          {mode === "manual" ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Автопроверка не настроена. Опишите, какие команды вы пробовали и что увидели.
              </p>
              <Textarea
                label="Отчёт"
                hint={`Минимум ${minLength} символов.`}
                value={manualNote}
                onChange={(e) => setManualNote(e.target.value)}
                rows={6}
                className="border-slate-200 bg-white"
              />
              <Button
                type="button"
                className="w-full sm:w-auto"
                loading={pending}
                disabled={manualNote.trim().length < minLength}
                onClick={() => {
                  onMessage(null, null);
                  startTransition(async () => {
                    const res = await verifyPracticeInteractiveAction({
                      moduleId,
                      practicalTaskId: taskId,
                      explanation: manualNote,
                    });
                    if (res.error) onMessage(res.error, null);
                    else onMessage(null, "Отправлено на ручную проверку.");
                  });
                }}
              >
                Отправить на проверку
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function CombinedForm({
  moduleId,
  taskId,
  minLength,
  accept,
  typesLabel,
  maxMb,
  startTransition,
  pending,
  submitBlocked,
  onMessage,
}: {
  moduleId: string;
  taskId: string;
  minLength: number;
  accept: string;
  typesLabel: string;
  maxMb: number;
  startTransition: TransitionStartFunction;
  pending: boolean;
  submitBlocked: boolean;
  onMessage: (err: string | null, ok: string | null) => void;
}) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const textOk = text.trim().length >= minLength;
  if (submitBlocked) {
    return (
      <div className="rounded-xl border border-cyan-100 bg-cyan-50/80 px-4 py-3 text-sm text-slate-600">
        Работа отправлена и ожидает проверки.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-600">Нужны и текст, и файл. Отправка на ручную проверку.</p>
      <Textarea
        label="Текстовая часть"
        hint={`Минимум ${minLength} символов.`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        className="border-slate-200 bg-white"
      />
      <p className="text-xs text-slate-600">
        Файл: {typesLabel}, до {maxMb} МБ.
      </p>
      <input
        type="file"
        accept={accept || undefined}
        className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <Button
        type="button"
        className="w-full sm:w-auto"
        loading={pending}
        disabled={!textOk || !file}
        onClick={() => {
          if (!file) return;
          onMessage(null, null);
          startTransition(async () => {
            const fd = new FormData();
            fd.set("moduleId", moduleId);
            fd.set("practicalTaskId", taskId);
            fd.set("text", text);
            fd.set("file", file);
            const res = await fetch("/api/practice/submit-combined", { method: "POST", body: fd });
            const data = (await res.json()) as { ok?: boolean; error?: string };
            if (!res.ok || !data.ok) {
              onMessage(data.error || "Ошибка отправки", null);
              return;
            }
            onMessage(null, "Работа отправлена на проверку.");
            setFile(null);
          });
        }}
      >
        Отправить работу
      </Button>
    </div>
  );
}
