import type { ReactNode } from "react";
import type { ParsedPracticeScenario } from "@/lib/practice-scenario-parse";
import { PracticeLabTerminal } from "@/components/practice/practice-lab-terminal";
import { LearningCallout } from "@/components/learn/learning-callout";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";

function ScenarioField({
  step,
  title,
  children,
}: {
  step: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="ce-practice-scenario-section space-y-2">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary/90">{step}</p>
      <h2 className="font-display text-base font-semibold text-foreground sm:text-lg">{title}</h2>
      <div className="typo-body-muted text-pretty">{children}</div>
    </section>
  );
}

export type PracticeLabScenarioProps = {
  parsed: ParsedPracticeScenario;
  /** Дополнительный контекст из description (если не вошёл в taskBrief). */
  contextNotes?: string | null;
  className?: string;
};

export function PracticeLabScenario({ parsed, contextNotes, className }: PracticeLabScenarioProps) {
  const context = contextNotes?.trim();

  return (
    <SectionCard variant="lab" className={cn("ce-practice-scenario relative space-y-6 overflow-hidden", className)}>
      <div className="ce-tech-grid pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden />

      <ScenarioField step="01 · Роль" title="Ваша роль в лаборатории">
        <p className="whitespace-pre-wrap">{parsed.studentRole}</p>
      </ScenarioField>

      <ScenarioField step="02 · Задача" title="Что нужно сделать">
        {parsed.taskBrief ? (
          <p className="whitespace-pre-wrap">{parsed.taskBrief}</p>
        ) : (
          <p>Выполните шаги в рабочей области и отправьте ответ на проверку.</p>
        )}
        {context && context !== parsed.taskBrief ? (
          <p className="mt-3 whitespace-pre-wrap border-t border-border/50 pt-3 text-sm">{context}</p>
        ) : null}
      </ScenarioField>

      {parsed.inputData ? (
        <ScenarioField step="03 · Вводные" title="Исходные данные">
          <PracticeLabTerminal title="artifacts/inbox.txt">
            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">{parsed.inputData}</pre>
          </PracticeLabTerminal>
        </ScenarioField>
      ) : null}

      <ScenarioField step={parsed.inputData ? "04 · Результат" : "03 · Результат"} title="Ожидаемый результат">
        <p className="whitespace-pre-wrap">{parsed.expectedOutcome}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Эталонные ответы не показываются до отправки — ориентируйтесь на критерии и подсказки.
        </p>
      </ScenarioField>

      <LearningCallout variant="info" label="Безопасность" title="Учебная среда">
        Симуляторы и демо-данные не связаны с реальными системами. Вредоносные действия не требуются.
      </LearningCallout>
    </SectionCard>
  );
}
