"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { simulateTrainingCommand } from "@/lib/training-console-sim";
import { verifyPracticeInteractiveAction } from "@/lib/actions/practice";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const WELCOME_LINES = [
  "Учебная консоль CyberEdu — режим песочницы. Команды ОС не выполняются.",
  "Введите help, чтобы увидеть список команд.",
  "",
] as const;

export type TrainingConsoleStructuredPractice = {
  moduleId: string;
  practicalTaskId: string;
  /** Требуется шаг с командой в консоли (эталон не показывается). */
  needsCommand: boolean;
  /** Требуется текстовое объяснение (проверка на сервере). */
  needsExplanation: boolean;
  minLength: number;
  /** Как в InteractiveForm: (error, successMessage) */
  onSubmitResult: (error: string | null, successMessage: string | null) => void;
};

export type TrainingConsoleProps = {
  className?: string;
  /** Баннер с инструкцией преподавателя (над терминалом) */
  instructionBanner?: string | null;
  /** Вызывается при «записываемой» учебной команде (ping, nslookup, whoami, ipconfig), не для help/clear */
  onRecordedCommand?: (normalizedCommand: string) => void;
  /**
   * Встроенная проверка практики: учебные команды в песочнице и отправка
   * verifyPracticeInteractiveAction (серверная валидация, без исполнения команд).
   */
  structuredPractice?: TrainingConsoleStructuredPractice;
};

export function TrainingConsole({
  className,
  instructionBanner,
  onRecordedCommand,
  structuredPractice,
}: TrainingConsoleProps) {
  const [lines, setLines] = useState<string[]>(() => [...WELCOME_LINES]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const [commandStepDone, setCommandStepDone] = useState(false);
  const [lastRecordedCommand, setLastRecordedCommand] = useState("");
  const [explanation, setExplanation] = useState("");
  const [submitPending, startSubmitTransition] = useTransition();

  const needsCommand = Boolean(structuredPractice?.needsCommand);
  const needsExplanation = Boolean(structuredPractice?.needsExplanation);
  const explanationMin = structuredPractice
    ? Math.max(12, structuredPractice.minLength)
    : 12;

  const commandReady = !needsCommand || commandStepDone;
  const canSubmitStructured =
    Boolean(structuredPractice) &&
    commandReady &&
    (!needsExplanation || explanation.trim().length >= explanationMin);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const applyClear = useCallback(() => {
    setLines([...WELCOME_LINES]);
    setCommandHistory([]);
    setCommandStepDone(false);
    setLastRecordedCommand("");
    setExplanation("");
  }, []);

  const append = useCallback((newLines: string[]) => {
    setLines((prev) => [...prev, ...newLines]);
  }, []);

  const runLine = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      setCommandHistory((h) => [...h, trimmed]);
      append([`$ ${trimmed}`]);

      const res = simulateTrainingCommand(trimmed);
      if (res.kind === "reject") {
        if (res.message) append([res.message]);
        return;
      }
      if (res.kind === "clear") {
        applyClear();
        return;
      }
      append(res.lines);
      if (res.lines.length) append([""]);

      if (res.recordedCommand) {
        onRecordedCommand?.(res.recordedCommand);
        setLastRecordedCommand(res.recordedCommand);
        if (structuredPractice && needsCommand) {
          setCommandStepDone(true);
        }
      }
    },
    [append, applyClear, needsCommand, onRecordedCommand, structuredPractice],
  );

  return (
    <div className={cn("min-w-0 space-y-4 overflow-x-clip", className)}>
      {instructionBanner?.trim() ? (
        <div className="rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs text-foreground whitespace-pre-wrap">
          {instructionBanner.trim()}
        </div>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Симулятор терминала: ввод обрабатывается только в браузере, без shell и без выполнения команд на сервере.
      </p>

      <div className={cn("ce-terminal w-full min-w-0 max-w-full overflow-hidden")}>
        <div className="ce-terminal-chrome flex items-center gap-2 border-b px-3 py-2.5">
          <div className="flex gap-1.5" aria-hidden>
            <span className="ce-terminal-dot-red size-3 rounded-full" />
            <span className="ce-terminal-dot-amber size-3 rounded-full" />
            <span className="ce-terminal-dot-green size-3 rounded-full" />
          </div>
          <div className="ce-terminal-dim min-w-0 flex-1 text-center font-mono text-[11px] font-medium tracking-wide">
            Учебная консоль · sandbox
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="ce-terminal-dim h-7 shrink-0 px-2 text-[11px] hover:bg-white/5 hover:text-[var(--terminal-fg)]"
            onClick={applyClear}
          >
            clear
          </Button>
        </div>

        <div
          className={cn(
            "ce-terminal-body relative max-h-[min(340px,52vh)] min-h-[220px] overflow-y-auto px-3 py-3",
            "text-[13px] leading-relaxed sm:text-sm",
            "selection:bg-[color-mix(in_oklab,var(--terminal-success)_25%,transparent)]",
          )}
          role="log"
          aria-live="polite"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 3px)",
            }}
            aria-hidden
          />
          <div className="relative space-y-0.5">
            {lines.map((line, i) => (
              <div
                key={`${i}-${line.slice(0, 32)}`}
                className={cn(
                  "whitespace-pre-wrap break-words",
                  line.startsWith("$ ") ? "ce-terminal-prompt" : "ce-terminal-dim",
                )}
              >
                {line}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        <form
          className="ce-terminal-footer flex items-stretch gap-2 border-t px-2 py-2"
          onSubmit={(e) => {
            e.preventDefault();
            runLine(draft);
            setDraft("");
          }}
        >
          <span className="ce-terminal-prompt hidden shrink-0 self-center px-1 font-mono text-xs sm:inline sm:text-sm" aria-hidden>
            cyberedu@lab:~$
          </span>
          <input
            className={cn(
              "ce-terminal-input min-h-11 min-w-0 flex-1 rounded-lg px-3 py-2.5 font-mono text-sm",
            )}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="help"
            autoComplete="off"
            spellCheck={false}
            aria-label="Учебная командная строка"
          />
          <Button type="submit" size="sm" variant="secondary" className="shrink-0">
            Ввод
          </Button>
        </form>
      </div>

      {commandHistory.length > 0 ? (
        <p className="text-[11px] text-muted-foreground">
          История ввода ({commandHistory.length}):{" "}
          <span className="font-mono text-foreground/80">{commandHistory.join(" → ")}</span>
        </p>
      ) : null}

      {structuredPractice ? (
        <div className="space-y-3 rounded-xl border border-border bg-card/40 p-4">
          {needsCommand ? (
            <p className="break-words text-xs text-muted-foreground">
              {commandStepDone ? (
                <span className="ce-terminal-success font-medium">
                  Учебная команда зафиксирована — можно отправить ответ на проверку сервером.
                </span>
              ) : (
                <span>Выполните команду по заданию в консоли выше. Эталонная команда не отображается.</span>
              )}
            </p>
          ) : null}

          {needsExplanation && (needsCommand ? commandStepDone : true) ? (
            <Textarea
              label="Объясните, что показывает результат команды"
              hint={`Минимум ${explanationMin} символов. Опишите строки вывода (TTL, время, IP и т.д.). Проверка — на сервере.`}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={5}
              className="min-h-[120px] font-mono text-sm"
            />
          ) : null}

          <Button
            type="button"
            className="w-full min-h-11 sm:w-auto"
            loading={submitPending}
            disabled={!canSubmitStructured}
            onClick={() => {
              if (!structuredPractice) return;
              structuredPractice.onSubmitResult(null, null);
              startSubmitTransition(async () => {
                const res = await verifyPracticeInteractiveAction({
                  moduleId: structuredPractice.moduleId,
                  practicalTaskId: structuredPractice.practicalTaskId,
                  command: needsCommand ? lastRecordedCommand : "",
                  explanation: needsExplanation ? explanation : "",
                });
                if (res.error) structuredPractice.onSubmitResult(res.error, null);
                else structuredPractice.onSubmitResult(null, "Задание засчитано автоматически.");
              });
            }}
          >
            Отправить ответ
          </Button>
        </div>
      ) : null}
    </div>
  );
}
