"use client";

import { useState, type TransitionStartFunction } from "react";
import type { PracticalTaskType, SubmissionStatus } from "@prisma/client";
import { submitPracticeStructuredAction } from "@/lib/actions/practice";
import { PracticeSubmissionSubmitFlow } from "@/components/practice/practice-submission-submit-flow";
import {
  buildPasswordRatingsSummary,
  buildSituationSubmitSummary,
} from "@/lib/practice-submit-confirmation-ui";
import { PhishingEmailTask } from "@/components/practice/PhishingEmailTask";
import { CryptoTask } from "@/components/practice/CryptoTask";
import { TrainingConsole } from "@/components/practice/TrainingConsole";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

type LatestRef = { status: SubmissionStatus; adminComment: string | null } | null;

type Props = {
  moduleId: string;
  taskId: string;
  taskType: PracticalTaskType;
  scenarioData: unknown;
  latestSubmission: LatestRef;
  practiceTitle: string;
  allowsResubmitOnRevision?: boolean;
  startTransition: TransitionStartFunction;
  pending: boolean;
  onMessage: (err: string | null, ok: string | null) => void;
};

/** Учебная консоль: только флаги UI; эталоны проверки остаются на сервере. */
export type ConsoleScenarioProps = {
  consoleScenario: string | null;
  hasStructuredCommandStep: boolean;
  hasStructuredExplanationStep: boolean;
  minLength: number;
};

export function ScenarioPracticeBlock(props: Props & { console?: ConsoleScenarioProps | null }) {
  const {
    moduleId,
    taskId,
    taskType,
    scenarioData,
    latestSubmission,
    practiceTitle,
    allowsResubmitOnRevision = true,
    startTransition,
    pending,
    onMessage,
    console,
  } = props;

  const sd = isRecord(scenarioData) ? scenarioData : null;

  const locked = latestSubmission && (latestSubmission.status === "SUBMITTED" || latestSubmission.status === "CHECKING");
  const done = latestSubmission?.status === "ACCEPTED";
  const needsRevision = latestSubmission?.status === "NEEDS_REVISION";
  const revisionNote = latestSubmission?.adminComment?.trim();

  if (done) {
    return <p className="border-t border-border pt-4 text-sm text-muted-foreground">Задание выполнено.</p>;
  }

  if (locked) {
    return (
      <p className="border-t border-border pt-4 text-sm text-muted-foreground">
        Предыдущая отправка ожидает проверки. Новая станет доступна после решения преподавателя.
      </p>
    );
  }

  if (needsRevision && !allowsResubmitOnRevision) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Работа на доработке, но повторная отправка сейчас недоступна. Дождитесь решения преподавателя.
      </p>
    );
  }

  const revisionBanner =
    needsRevision && allowsResubmitOnRevision ? (
      <div className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm ring-1 ring-inset ring-warning/20">
        <p className="font-semibold text-warning">Работа на доработке</p>
        {revisionNote ? (
          <p className="mt-2 text-pretty leading-relaxed text-foreground/90">
            <span className="font-medium text-foreground">Комментарий: </span>
            {revisionNote}
          </p>
        ) : (
          <p className="mt-2 text-muted-foreground">Внесите правки и отправьте работу снова.</p>
        )}
      </div>
    ) : null;

  return (
    <div className="space-y-4">
      {revisionBanner}
      {taskType === "SITUATION_CHOICE" ? (
        <SituationChoiceForm
          sd={sd}
          moduleId={moduleId}
          taskId={taskId}
          practiceTitle={practiceTitle}
          allowsResubmitOnRevision={allowsResubmitOnRevision}
          startTransition={startTransition}
          pending={pending}
          onMessage={onMessage}
        />
      ) : null}
      {taskType === "PASSWORD_ANALYSIS" ? (
        <PasswordAnalysisForm
          sd={sd}
          moduleId={moduleId}
          taskId={taskId}
          practiceTitle={practiceTitle}
          allowsResubmitOnRevision={allowsResubmitOnRevision}
          startTransition={startTransition}
          pending={pending}
          onMessage={onMessage}
        />
      ) : null}
      {taskType === "PHISHING_ANALYSIS" ? (
        <PhishingEmailTask
          moduleId={moduleId}
          practicalTaskId={taskId}
          disabled={Boolean(locked)}
          onResult={onMessage}
        />
      ) : null}
      {taskType === "CRYPTO_TASK" ? (
        <CryptoTask
          moduleId={moduleId}
          practicalTaskId={taskId}
          disabled={Boolean(locked)}
          onResult={onMessage}
        />
      ) : null}
      {taskType === "TRAINING_CONSOLE" && console ? (
        <TrainingConsoleScenarioForm
          moduleId={moduleId}
          taskId={taskId}
          console={console}
          startTransition={startTransition}
          pending={pending}
          onMessage={onMessage}
        />
      ) : null}
    </div>
  );
}

async function submitJsonPayload(
  moduleId: string,
  taskId: string,
  payload: unknown,
  onMessage: (e: string | null, o: string | null) => void,
): Promise<string | null> {
  onMessage(null, null);
  const res = await submitPracticeStructuredAction({
    moduleId,
    practicalTaskId: taskId,
    payload: JSON.stringify(payload),
  });
  if (res.error) {
    onMessage(res.error, null);
    return res.error;
  }
  if (res.pendingReview) {
    onMessage(null, "Ответ принят. Ключевые слова в выводе неполные — работа ушла на проверку преподавателю.");
  } else {
    onMessage(null, "Верно! Задание засчитано автоматически.");
  }
  return null;
}

function SituationChoiceForm({
  sd,
  moduleId,
  taskId,
  practiceTitle,
  allowsResubmitOnRevision = true,
  startTransition,
  pending,
  onMessage,
}: {
  sd: Record<string, unknown> | null;
  moduleId: string;
  taskId: string;
  practiceTitle: string;
  allowsResubmitOnRevision?: boolean;
  startTransition: TransitionStartFunction;
  pending: boolean;
  onMessage: (e: string | null, o: string | null) => void;
}) {
  const situations = sd && Array.isArray(sd.situations) ? sd.situations.filter(isRecord) : [];
  const [answers, setAnswers] = useState<Record<string, { personalData: string; risk: string; safeAction: string }>>(
    () => ({}),
  );

  if (!situations.length) return <p className="text-sm text-danger">Сценарий не загружен.</p>;

  function setField(sid: string, field: "personalData" | "risk" | "safeAction", value: string) {
    setAnswers((prev) => ({
      ...prev,
      [sid]: { ...prev[sid], personalData: prev[sid]?.personalData ?? "", risk: prev[sid]?.risk ?? "", safeAction: prev[sid]?.safeAction ?? "", [field]: value },
    }));
  }

  const complete = situations.every((sit) => {
    const id = String(sit.id ?? "");
    const a = answers[id];
    return a?.personalData && a?.risk && a?.safeAction;
  });

  const filledCount = situations.filter((sit) => {
    const id = String(sit.id ?? "");
    const a = answers[id];
    return a?.personalData && a?.risk && a?.safeAction;
  }).length;

  return (
    <div className="space-y-6">
      {situations.map((sit) => {
        const id = String(sit.id ?? "");
        const text = typeof sit.text === "string" ? sit.text : "";
        const choices = isRecord(sit.choices) ? sit.choices : {};
        const personalData = Array.isArray(choices.personalData) ? choices.personalData.filter(isRecord) : [];
        const risk = Array.isArray(choices.risk) ? choices.risk.filter(isRecord) : [];
        const safeAction = Array.isArray(choices.safeAction) ? choices.safeAction.filter(isRecord) : [];
        return (
          <div key={id} className="rounded-xl border border-border bg-card/50 p-4 space-y-3">
            <p className="text-sm font-medium text-foreground">{text}</p>
            <label className="block text-xs font-medium text-muted-foreground">
              Где персональные данные?
              <select
                className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-sm text-foreground"
                value={answers[id]?.personalData ?? ""}
                onChange={(e) => setField(id, "personalData", e.target.value)}
              >
                <option value="">—</option>
                {personalData.map((o) => (
                  <option key={String(o.id)} value={String(o.id)}>
                    {String(o.label ?? o.id)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium text-muted-foreground">
              Уровень риска
              <select
                className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-sm text-foreground"
                value={answers[id]?.risk ?? ""}
                onChange={(e) => setField(id, "risk", e.target.value)}
              >
                <option value="">—</option>
                {risk.map((o) => (
                  <option key={String(o.id)} value={String(o.id)}>
                    {String(o.label ?? o.id)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium text-muted-foreground">
              Безопасное действие
              <select
                className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-sm text-foreground"
                value={answers[id]?.safeAction ?? ""}
                onChange={(e) => setField(id, "safeAction", e.target.value)}
              >
                <option value="">—</option>
                {safeAction.map((o) => (
                  <option key={String(o.id)} value={String(o.id)}>
                    {String(o.label ?? o.id)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        );
      })}
      <PracticeSubmissionSubmitFlow
        practiceTitle={practiceTitle}
        allowsResubmitOnRevision={allowsResubmitOnRevision}
        label="Проверить ответы"
        pending={pending}
        disabled={!complete}
        startTransition={startTransition}
        getSummary={() => buildSituationSubmitSummary(filledCount, situations.length)}
        onSubmit={() => submitJsonPayload(moduleId, taskId, { answers }, onMessage)}
      />
    </div>
  );
}

function PasswordAnalysisForm({
  sd,
  moduleId,
  taskId,
  practiceTitle,
  allowsResubmitOnRevision = true,
  startTransition,
  pending,
  onMessage,
}: {
  sd: Record<string, unknown> | null;
  moduleId: string;
  taskId: string;
  practiceTitle: string;
  allowsResubmitOnRevision?: boolean;
  startTransition: TransitionStartFunction;
  pending: boolean;
  onMessage: (e: string | null, o: string | null) => void;
}) {
  const items = sd && Array.isArray(sd.items) ? sd.items.filter(isRecord) : [];
  const [ratings, setRatings] = useState<Record<string, string>>({});

  if (!items.length) return <p className="text-sm text-danger">Сценарий не загружен.</p>;

  const complete = items.every((it) => ratings[String(it.id ?? "")]);

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Оцените каждый учебный пароль: слабый, средний или надёжный.</p>
      {items.map((it) => {
        const id = String(it.id ?? "");
        const sample = typeof it.sample === "string" ? it.sample : "";
        const note = typeof it.note === "string" ? it.note : "";
        return (
          <div key={id} className="rounded-xl border border-border p-3 space-y-2">
            <p className="font-mono text-sm break-all">{sample}</p>
            {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
            <div className="flex flex-wrap gap-3 text-sm">
              {(["WEAK", "MEDIUM", "STRONG"] as const).map((v) => (
                <label key={v} className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name={`pw-${id}`}
                    checked={ratings[id] === v}
                    onChange={() => setRatings((r) => ({ ...r, [id]: v }))}
                  />
                  {v === "WEAK" ? "Слабый" : v === "MEDIUM" ? "Средний" : "Надёжный"}
                </label>
              ))}
            </div>
          </div>
        );
      })}
      <PracticeSubmissionSubmitFlow
        practiceTitle={practiceTitle}
        allowsResubmitOnRevision={allowsResubmitOnRevision}
        label="Проверить оценки"
        pending={pending}
        disabled={!complete}
        startTransition={startTransition}
        getSummary={() => buildPasswordRatingsSummary(Object.keys(ratings).length, items.length)}
        onSubmit={() => submitJsonPayload(moduleId, taskId, { ratings }, onMessage)}
      />
    </div>
  );
}

function TrainingConsoleScenarioForm(props: {
  moduleId: string;
  taskId: string;
  console: ConsoleScenarioProps;
  startTransition: TransitionStartFunction;
  pending: boolean;
  onMessage: (e: string | null, o: string | null) => void;
}) {
  const { moduleId, taskId, console, onMessage } = props;
  const explanationMin = Math.max(12, console.minLength);

  return (
    <TrainingConsole
      instructionBanner={console.consoleScenario}
      structuredPractice={{
        moduleId,
        practicalTaskId: taskId,
        needsCommand: console.hasStructuredCommandStep,
        needsExplanation: console.hasStructuredExplanationStep,
        minLength: explanationMin,
        onSubmitResult: (err, ok) => {
          if (err) onMessage(err, null);
          else onMessage(null, ok);
        },
      }}
    />
  );
}
