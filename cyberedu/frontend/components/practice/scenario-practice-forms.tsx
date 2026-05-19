"use client";

import { useState, type TransitionStartFunction } from "react";
import type { PracticalTaskType, SubmissionStatus } from "@prisma/client";
import { submitPracticeStructuredAction } from "@/lib/actions/practice";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PhishingEmailTask } from "@/components/practice/PhishingEmailTask";
import { UrlAnalysisTask } from "@/components/practice/UrlAnalysisTask";
import { CryptoTask } from "@/components/practice/CryptoTask";
import { LogAnalysisTask } from "@/components/practice/LogAnalysisTask";
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
  startTransition: TransitionStartFunction;
  pending: boolean;
  onMessage: (err: string | null, ok: string | null) => void;
};

/** Учебная консоль (модуль 6): те же поля, что и у INTERACTIVE, передаются с страницы практики. */
export type ConsoleScenarioProps = {
  consoleScenario: string | null;
  expectedCommand: string | null;
  expectedAnswerPattern: string | null;
  minLength: number;
};

export function ScenarioPracticeBlock(props: Props & { console?: ConsoleScenarioProps | null }) {
  const { moduleId, taskId, taskType, scenarioData, latestSubmission, startTransition, pending, onMessage, console } =
    props;

  const sd = isRecord(scenarioData) ? scenarioData : null;
  const hints =
    sd && Array.isArray(sd.hints) ? sd.hints.filter((x): x is string => typeof x === "string") : ([] as string[]);
  const criteria = sd && typeof sd.criteria === "string" ? sd.criteria : "";

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

  const revisionBanner =
    needsRevision ? (
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

  const hintBlock =
    hints.length > 0 || criteria ? (
      <div className="space-y-2 rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm">
        {hints.length > 0 ? (
          <div>
            <p className="font-medium text-foreground">Подсказки</p>
            <ul className="mt-1 list-disc pl-5 text-muted-foreground">
              {hints.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {criteria ? (
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Критерии оценивания: </span>
            {criteria}
          </p>
        ) : null}
      </div>
    ) : null;

  return (
    <div className="space-y-4 border-t border-border pt-4">
      {revisionBanner}
      {hintBlock}
      {taskType === "SITUATION_CHOICE" ? (
        <SituationChoiceForm
          sd={sd}
          moduleId={moduleId}
          taskId={taskId}
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
      {taskType === "CHECKLIST" ? (
        <ChecklistForm
          sd={sd}
          moduleId={moduleId}
          taskId={taskId}
          startTransition={startTransition}
          pending={pending}
          onMessage={onMessage}
        />
      ) : null}
      {taskType === "URL_ANALYSIS" ? (
        <UrlAnalysisTask
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
      {taskType === "LOG_ANALYSIS" ? (
        <LogAnalysisTask
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

function submitJson(
  moduleId: string,
  taskId: string,
  payload: unknown,
  startTransition: TransitionStartFunction,
  onMessage: (e: string | null, o: string | null) => void,
) {
  onMessage(null, null);
  startTransition(async () => {
    const res = await submitPracticeStructuredAction({
      moduleId,
      practicalTaskId: taskId,
      payload: JSON.stringify(payload),
    });
    if (res.error) onMessage(res.error, null);
    else if (res.pendingReview) {
      onMessage(null, "Ответ принят. Ключевые слова в выводе неполные — работа ушла на проверку преподавателю.");
    } else onMessage(null, "Верно! Задание засчитано автоматически.");
  });
}

function SituationChoiceForm({
  sd,
  moduleId,
  taskId,
  startTransition,
  pending,
  onMessage,
}: {
  sd: Record<string, unknown> | null;
  moduleId: string;
  taskId: string;
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
      <Button type="button" loading={pending} disabled={!complete} onClick={() => submitJson(moduleId, taskId, { answers }, startTransition, onMessage)}>
        Проверить ответы
      </Button>
    </div>
  );
}

function PasswordAnalysisForm({
  sd,
  moduleId,
  taskId,
  startTransition,
  pending,
  onMessage,
}: {
  sd: Record<string, unknown> | null;
  moduleId: string;
  taskId: string;
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
      <Button type="button" loading={pending} disabled={!complete} onClick={() => submitJson(moduleId, taskId, { ratings }, startTransition, onMessage)}>
        Проверить оценки
      </Button>
    </div>
  );
}

function ChecklistForm({
  sd,
  moduleId,
  taskId,
  startTransition,
  pending,
  onMessage,
}: {
  sd: Record<string, unknown> | null;
  moduleId: string;
  taskId: string;
  startTransition: TransitionStartFunction;
  pending: boolean;
  onMessage: (e: string | null, o: string | null) => void;
}) {
  const items = sd && Array.isArray(sd.items) ? sd.items.filter(isRecord) : [];
  const [checked, setChecked] = useState<Set<string>>(() => new Set());
  const [reflection, setReflection] = useState("");

  if (!items.length) return <p className="text-sm text-danger">Сценарий не загружен.</p>;

  const minR = Math.max(20, Math.min(2000, Number(sd?.reflectionMinLength) || 40));

  function toggle(id: string) {
    setChecked((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  const allOn = items.every((it) => checked.has(String(it.id ?? "")));

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {items.map((it) => {
          const id = String(it.id ?? "");
          const label = String(it.label ?? id);
          return (
            <li key={id}>
              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={checked.has(id)} onChange={() => toggle(id)} className="mt-1" />
                <span>{label}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <Textarea
        label="Коротко опишите свой план внедрения (например, как включить обновления на вашей системе)"
        hint={`Не менее ${minR} символов; упомяните тему чек-листа словами «обновления», «антивирус», «блокировка», «резерв» или «USB».`}
        value={reflection}
        onChange={(e) => setReflection(e.target.value)}
        rows={5}
      />
      <Button
        type="button"
        loading={pending}
        disabled={!allOn || reflection.trim().length < minR}
        onClick={() =>
          submitJson(moduleId, taskId, { checked: [...checked], reflection }, startTransition, onMessage)
        }
      >
        Отправить на проверку
      </Button>
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
  const ec = console.expectedCommand?.trim() ?? "";
  const ep = console.expectedAnswerPattern?.trim() ?? "";
  const needsCommand = Boolean(ec);
  const needsExplanation = Boolean(ep);
  const explanationMin = Math.max(12, console.minLength);

  return (
    <TrainingConsole
      instructionBanner={console.consoleScenario}
      structuredPractice={{
        moduleId,
        practicalTaskId: taskId,
        expectedCommand: needsCommand ? ec : null,
        expectedAnswerPattern: needsExplanation ? ep : null,
        minLength: explanationMin,
        onSubmitResult: (err, ok) => {
          if (err) onMessage(err, null);
          else onMessage(null, ok);
        },
      }}
    />
  );
}
