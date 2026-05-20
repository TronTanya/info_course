"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition, type TransitionStartFunction } from "react";
import type { CheckType, PracticalTaskType, SubmissionStatus } from "@prisma/client";
import type { ProgressGate } from "@/lib/course-progress-guards";
import { AiMentorChat } from "@/components/ai/AiMentorChat";
import { PracticeLabLayout } from "@/components/layout/practice-lab-layout";
import { PracticeLabAside } from "@/components/practice/practice-lab-aside";
import { PracticeLabResult } from "@/components/practice/practice-lab-result";
import { PracticeLabAfterSubmit } from "@/components/practice/practice-lab-after-submit";
import { PracticeLabAnswerArea } from "@/components/practice/practice-lab-answer-area";
import { PracticeLabEvidence } from "@/components/practice/practice-lab-evidence";
import { PracticeLabHints } from "@/components/practice/practice-lab-hints";
import { PracticeLabScenario } from "@/components/practice/practice-lab-scenario";
import { parsePracticeScenario } from "@/lib/practice-scenario-parse";
import { PracticeLabSkeleton } from "@/components/practice/practice-lab-skeleton";
import { PracticeLabTopBar } from "@/components/practice/practice-lab-top-bar";
import { PracticeLabWorkspace } from "@/components/practice/practice-lab-workspace";
import { estimatePracticeMinutes, getPracticeLabState } from "@/lib/practice-lab-ui";
import type { ChecklistItem } from "@/components/learn/learning-checklist";
import { useToast } from "@/components/ui/toast";
import { ScenarioPracticeBlock } from "@/components/practice/scenario-practice-forms";
import { TrainingConsole } from "@/components/practice/TrainingConsole";
import { PracticeLabTerminal } from "@/components/practice/practice-lab-terminal";
import { submitPracticeTextAction, verifyPracticeInteractiveAction } from "@/lib/actions/practice";
import { PracticeEmpty } from "@/components/practice/practice-empty";
import { BlockedState } from "@/components/ui/blocked-state";
import { LockedCard } from "@/components/ui/locked-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { PendingBanner } from "@/components/ui/pending-banner";
import { practiceStepBreadcrumbs } from "@/lib/student-nav";
import { SectionCard } from "@/components/ui/section-card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useFormDraft } from "@/lib/hooks/use-form-draft";

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
  attemptCount: number;
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

function practiceChecklist(labState: ReturnType<typeof getPracticeLabState>, hasSubmission: boolean): ChecklistItem[] {
  return [
    { text: "Изучить сценарий и цель", checked: labState !== "not_started" },
    { text: "Выполнить шаги в терминале", checked: hasSubmission || labState === "in_progress" || labState === "correct" },
    {
      text: "Отправить ответ на проверку",
      checked: hasSubmission || labState === "submitted" || labState === "passed" || labState === "needs_review",
    },
    { text: "Получить зачёт", checked: labState === "passed" },
  ];
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
      <>
        <LockedCard
          title="Практика недоступна"
          description={practiceGate.message}
          action={
            cta ? (
              <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
                <Link href={cta.href}>{cta.label}</Link>
              </Button>
            ) : undefined
          }
        />
        <AiMentorChat moduleId={moduleId} openSignal={chatOpenSeq} contextLabels={{ moduleTitle }} />
      </>
    );
  }

  if (tasks.length === 0) {
    return (
      <>
        <PracticeEmpty moduleId={moduleId} />
        <AiMentorChat moduleId={moduleId} openSignal={chatOpenSeq} contextLabels={{ moduleTitle }} />
      </>
    );
  }

  return (
    <div className="space-y-8">
      {tasks.map((task, index) => (
        <PracticeLabSession
          key={task.id}
          moduleId={moduleId}
          labContext={labContext}
          task={task}
          taskAnchorId={`practice-lab-${task.id}`}
          nextPracticeAnchor={tasks[index + 1] ? `#practice-lab-${tasks[index + 1].id}` : null}
          onOpenAiChat={() => setChatOpenSeq((n) => n + 1)}
        />
      ))}
      <AiMentorChat
        moduleId={moduleId}
        practicalTaskId={chatTaskId ?? undefined}
        openSignal={chatOpenSeq}
        contextLabels={{
          moduleTitle,
          taskTitle: tasks.length === 1 ? tasks[0].title : undefined,
          topic: tasks.length === 1 ? tasks[0].title : moduleTitle,
        }}
      />
    </div>
  );
}

function PracticeLabSession({
  moduleId,
  labContext,
  task,
  taskAnchorId,
  nextPracticeAnchor,
  onOpenAiChat,
}: {
  moduleId: string;
  labContext: PracticeLabModuleContext;
  task: ClientPracticalTask;
  taskAnchorId: string;
  nextPracticeAnchor: string | null;
  onOpenAiChat: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [checkFlash, setCheckFlash] = useState<"correct" | "wrong" | null>(null);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  const sub = task.latestSubmission;
  const pendingReview = Boolean(sub && (sub.status === "SUBMITTED" || sub.status === "CHECKING"));
  const needsRevision = sub?.status === "NEEDS_REVISION";
  const accepted = sub?.status === "ACCEPTED";
  const lab = taskLabComponentLabel(task.taskType);
  const labState = getPracticeLabState(sub, { flash: checkFlash });
  const estimatedMinutes = estimatePracticeMinutes(task.taskType, task.maxScore);
  const parsedScenario = parsePracticeScenario(
    task.description,
    task.instruction,
    task.consoleScenario,
    task.scenarioData,
    task.taskType,
  );
  const answerRequirements = criteriaBullets(task);
  const canRetry = !pendingReview && !accepted;
  const submissionExplanation =
    sub?.adminComment?.trim() ||
    (info && !error ? info : null) ||
    (needsRevision ? "Требуется доработка по комментарию проверяющего." : null);

  function onMessage(err: string | null, ok: string | null) {
    setError(err);
    setInfo(ok);
    if (err) {
      setCheckFlash("wrong");
      toast({ title: "Проверка не пройдена", description: err, variant: "error" });
    } else if (ok) {
      setCheckFlash(/верно|засчитан/i.test(ok) ? "correct" : null);
      toast({ title: /верно|засчитан/i.test(ok) ? "Верно" : "Отправлено", description: ok, variant: "success" });
      router.refresh();
    } else {
      setCheckFlash(null);
    }
  }

  const latestForScenario = sub ? { status: sub.status, adminComment: sub.adminComment } : null;
  const { moduleProgress } = labContext;

  const breadcrumb = (
    <Breadcrumbs items={practiceStepBreadcrumbs(moduleId, labContext.moduleOrderNumber)} />
  );

  const header = (
    <PracticeLabTopBar
      taskTitle={task.title}
      moduleTitle={labContext.moduleTitle}
      moduleOrderNumber={labContext.moduleOrderNumber}
      maxScore={task.maxScore}
      score={sub?.score ?? null}
      labState={labState}
      moduleId={moduleId}
      estimatedMinutes={estimatedMinutes}
    />
  );

  const main = (
    <div id={taskAnchorId} className="scroll-mt-24 space-y-6">
      <PracticeLabResult
        labState={labState}
        error={error}
        info={info}
        needsRevision={needsRevision}
        revisionComment={sub?.adminComment}
        accepted={accepted}
        showIntro={!sub && !pendingReview && !accepted}
        pendingReview={pendingReview}
      />
      {pending ? (
        <div className="space-y-3" aria-busy="true" aria-live="polite">
          <PendingBanner label="Проверка на сервере…" />
          <PracticeLabSkeleton />
        </div>
      ) : null}

      <PracticeLabScenario parsed={parsedScenario} contextNotes={task.description} />

      <PracticeLabEvidence blocks={parsedScenario.evidence} taskType={task.taskType} />

      <PracticeLabHints levels={parsedScenario.hintLevels} />

      <PracticeLabWorkspace taskTypeLabel={taskTypeRu(task.taskType)} componentLabel={lab}>
        <PracticeLabAnswerArea requirements={answerRequirements}>
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
        </PracticeLabAnswerArea>
      </PracticeLabWorkspace>

      {sub ? (
        <PracticeLabAfterSubmit
          moduleId={moduleId}
          status={sub.status}
          score={sub.score}
          maxScore={task.maxScore}
          adminComment={sub.adminComment}
          explanation={submissionExplanation}
          createdAt={sub.createdAt}
          canRetry={canRetry}
          nextPracticeAnchor={nextPracticeAnchor}
          onRetry={
            canRetry
              ? () => {
                  setError(null);
                  setInfo(null);
                  setCheckFlash(null);
                }
              : undefined
          }
        />
      ) : null}

      {sub?.fileDownloadUrl ? (
        <SectionCard variant="muted" flushTitle className="p-4">
          <a className="font-medium text-primary underline-offset-4 hover:underline" href={sub.fileDownloadUrl}>
            Скачать прикреплённый файл
          </a>
        </SectionCard>
      ) : null}
    </div>
  );

  const aside = (
    <PracticeLabAside
      moduleId={moduleId}
      practicalTaskId={task.id}
      labState={labState}
      checklist={practiceChecklist(labState, Boolean(sub))}
      attemptCount={task.attemptCount}
      recommendations={[passingScoreHint(task), ...criteriaBullets(task).slice(0, 3)]}
      moduleProgress={moduleProgress}
      onOpenAiChat={onOpenAiChat}
    />
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
  const isDirty = text.trim().length > 0;
  const { clearDraft } = useFormDraft({
    storageKey: `ce-practice-text:${moduleId}:${taskId}`,
    value: text,
    onRestore: setText,
    isDirty,
    enabled: !submitBlocked,
  });
  const okLen = text.trim().length >= minLength;
  if (submitBlocked) {
    return (
      <BlockedState>
        Эта отправка ожидает проверки. Новая станет доступна после решения преподавателя.
      </BlockedState>
    );
  }
  return (
    <div className="space-y-4">
      <PracticeLabTerminal title="stdout — введите ответ">
        <Textarea
          label="Поле ответа"
          hint={`Не менее ${minLength} символов.`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          className="ce-terminal-input min-h-[160px] border-0 bg-transparent shadow-none focus-visible:ring-[var(--terminal-accent)]/40"
        />
      </PracticeLabTerminal>
      <Button
        type="button"
        variant="primary"
        className="w-full sm:w-auto"
        loading={pending}
        disabled={!okLen || pending}
        onClick={() => {
          onMessage(null, null);
          startTransition(async () => {
            const res = await submitPracticeTextAction({ moduleId, practicalTaskId: taskId, text });
            if (res.error) onMessage(res.error, null);
            else {
              clearDraft();
              onMessage(null, "Работа отправлена на проверку.");
            }
          });
        }}
      >
        Проверить
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
  const fileInputId = useId();
  const [file, setFile] = useState<File | null>(null);
  if (submitBlocked) {
    return (
      <BlockedState>
        Файл уже отправлен и ожидает проверки.
      </BlockedState>
    );
  }
  return (
    <div className="space-y-3">
      <PracticeLabTerminal title="upload@lab">
        <p className="ce-terminal-dim text-xs">
          Форматы: {typesLabel}. До {maxMb} МБ. Исполняемые файлы не принимаются.
        </p>
      </PracticeLabTerminal>
      <label htmlFor={fileInputId} className="text-sm font-medium text-foreground">
        Файл для отправки
      </label>
      <input
        id={fileInputId}
        type="file"
        accept={accept || undefined}
        className="block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <Button
        type="button"
        variant="primary"
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
        Проверить
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
    return <p className="text-sm text-muted-foreground">Задание выполнено.</p>;
  }

  if (submitBlocked) {
    return (
      <BlockedState>
        Ответ отправлен и ожидает проверки преподавателем.
      </BlockedState>
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
            <div className="rounded-xl border border-border bg-muted/50 px-3 py-2 text-xs text-foreground whitespace-pre-wrap">
              {consoleScenario.trim()}
            </div>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Учебная консоль — симулятор: команды не выполняются на сервере и не вызывают реальную ОС.
          </p>
          <TrainingConsole />
          {mode === "legacy" ? (
            <div className="space-y-2">
              {!hasAuto ? (
                <p className="text-xs text-muted-foreground">Автопроверка не настроена — ответ уйдет на ручную проверку.</p>
              ) : null}
              <label className="block space-y-1 text-sm">
                <span className="font-medium text-foreground">Кодовая фраза из задания</span>
                <input
                  className={cn(
                    "w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                  )}
                  value={legacyAnswer}
                  onChange={(e) => setLegacyAnswer(e.target.value)}
                  autoComplete="off"
                />
              </label>
              <Button
                type="button"
                variant="primary"
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
              <p className="text-xs text-muted-foreground">
                Автопроверка не настроена. Опишите, какие команды вы пробовали и что увидели.
              </p>
              <Textarea
                label="Отчёт"
                hint={`Минимум ${minLength} символов.`}
                value={manualNote}
                onChange={(e) => setManualNote(e.target.value)}
                rows={6}
                className="border-border bg-card"
              />
              <Button
                type="button"
                variant="primary"
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
                Проверить
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
  const fileInputId = useId();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const textOk = text.trim().length >= minLength;
  if (submitBlocked) {
    return (
      <BlockedState>
        Работа отправлена и ожидает проверки.
      </BlockedState>
    );
  }
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Нужны и текст, и файл. Отправка на ручную проверку.</p>
      <PracticeLabTerminal title="answer@lab">
        <Textarea
          label="Текстовая часть"
          hint={`Минимум ${minLength} символов.`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          className="ce-terminal-input border-0 bg-transparent shadow-none"
        />
      </PracticeLabTerminal>
      <label htmlFor={fileInputId} className="text-sm font-medium text-foreground">
        Файл ({typesLabel}, до {maxMb} МБ)
      </label>
      <input
        id={fileInputId}
        type="file"
        accept={accept || undefined}
        className="block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <Button
        type="button"
        variant="primary"
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
        Проверить
      </Button>
    </div>
  );
}
