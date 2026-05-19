import type { ReactNode } from "react";
import { PracticeLabTerminal } from "@/components/practice/practice-lab-terminal";
import { LearningCallout } from "@/components/learn/learning-callout";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";

function ScenarioSection({
  eyebrow,
  title,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("ce-practice-scenario-section space-y-2", className)}>
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary/90">{eyebrow}</p>
      <h2 className="font-display text-base font-semibold text-foreground sm:text-lg">{title}</h2>
      <div className="typo-body-muted text-pretty">{children}</div>
    </section>
  );
}

export type PracticeLabScenarioProps = {
  scenarioText: string;
  goalText: string | null;
  goalFallback: string;
  conditions: string[];
  inputData: string | null;
  className?: string;
};

export function PracticeLabScenario({
  scenarioText,
  goalText,
  goalFallback,
  conditions,
  inputData,
  className,
}: PracticeLabScenarioProps) {
  const scenarioLines = scenarioText.split("\n").filter((l) => l.trim());

  return (
    <SectionCard variant="lab" className={cn("ce-practice-scenario relative space-y-6 overflow-hidden", className)}>
      <div className="ce-tech-grid pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden />

      <ScenarioSection eyebrow="01 · Сценарий" title="Описание инцидента">
        {scenarioLines.length > 0 ? (
          <div className="space-y-2">
            {scenarioLines.map((line, i) => (
              <p key={i} className="whitespace-pre-wrap">
                {line}
              </p>
            ))}
          </div>
        ) : (
          <p>Изучите условие и перейдите к рабочей области лаборатории.</p>
        )}
      </ScenarioSection>

      <ScenarioSection eyebrow="02 · Цель" title="Задача лаборатории">
        {goalText ? <p className="whitespace-pre-wrap">{goalText}</p> : <p>{goalFallback}</p>}
      </ScenarioSection>

      {conditions.length > 0 ? (
        <ScenarioSection eyebrow="03 · Условия" title="Правила выполнения">
          <ul className="list-none space-y-2 pl-0">
            {conditions.map((line) => (
              <li key={line} className="flex gap-2 before:font-mono before:text-primary before:content-['›']">
                {line}
              </li>
            ))}
          </ul>
        </ScenarioSection>
      ) : null}

      {inputData?.trim() ? (
        <ScenarioSection eyebrow="04 · Входные данные" title="Исходные артефакты">
          <PracticeLabTerminal title="artifacts/inbox.txt">
            <pre className="whitespace-pre-wrap">{inputData.trim()}</pre>
          </PracticeLabTerminal>
        </ScenarioSection>
      ) : null}

      <LearningCallout variant="info" label="Безопасность" title="Учебная среда">
        Симуляторы и демо-данные не связаны с реальными системами. Вредоносные действия не требуются.
      </LearningCallout>
    </SectionCard>
  );
}
