"use client";

import { ListChecks } from "lucide-react";
import {
  buildTaskInstructionsSections,
  isTaskInstructionsReady,
  TASK_INSTRUCTIONS_EMPTY_MESSAGE,
  TASK_INSTRUCTIONS_SECTION_LABELS,
  type TaskInstructionsSections,
} from "@/lib/practice-task-instructions-ui";
import type { PracticeInstruction, SafeRubricItem } from "@/types/practice-view-model";
import { cn } from "@/lib/utils";

function InstructionBulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5 text-sm leading-relaxed text-foreground/95" role="list">
      {items.map((line) => (
        <li key={line} className="flex gap-2.5 text-pretty">
          <span
            className="mt-2 size-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.5)]"
            aria-hidden
          />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}

function InstructionSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-2.5">
      <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-primary/90">{title}</h3>
      <div className="rounded-xl border border-border/50 bg-background/25 px-4 py-3.5">
        <InstructionBulletList items={items} />
      </div>
    </section>
  );
}

export type TaskInstructionsProps = {
  instructions: PracticeInstruction[];
  safeRubric: SafeRubricItem[];
  className?: string;
  /** Для тестов: готовые секции без пересборки */
  sections?: TaskInstructionsSections;
};

export function TaskInstructions({
  instructions,
  safeRubric,
  className,
  sections: sectionsOverride,
}: TaskInstructionsProps) {
  const sections = sectionsOverride ?? buildTaskInstructionsSections(instructions, safeRubric);

  if (!isTaskInstructionsReady(sections)) {
    return (
      <section
        className={cn(
          "ce-task-instructions ce-glass relative overflow-hidden rounded-2xl",
          "border border-border/60 bg-linear-to-br from-card/80 via-card/65 to-muted/20",
          "min-w-0 overflow-x-clip p-4 sm:p-6",
          className,
        )}
        aria-label="Инструкции к заданию"
      >
        <div className="relative flex flex-col items-center gap-3 py-6 text-center sm:py-8">
          <div className="flex size-12 items-center justify-center rounded-xl border border-border/60 bg-muted/25 text-muted-foreground">
            <ListChecks className="size-6" aria-hidden />
          </div>
          <p className="font-display text-base font-semibold text-foreground">Инструкции</p>
          <p className="max-w-md text-sm text-muted-foreground">{TASK_INSTRUCTIONS_EMPTY_MESSAGE}</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "ce-task-instructions ce-glass relative overflow-hidden rounded-2xl",
        "border border-cyan/15 bg-linear-to-br from-card/85 via-card/72 to-primary/[0.05]",
        "shadow-[0_0_28px_-12px_hsl(var(--cyan)/0.25)] ring-1 ring-cyan/10",
        "min-w-0 overflow-x-clip p-4 sm:p-6",
        className,
      )}
      aria-label="Инструкции к заданию"
    >
      <div className="ce-learn-grid pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden />

      <div className="relative space-y-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-cyan/25 bg-cyan/10 text-cyan">
            <ListChecks className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-cyan">Задание</p>
            <h2 className="font-display text-lg font-semibold text-foreground sm:text-xl">Инструкции</h2>
          </div>
        </div>

        <InstructionSection title={TASK_INSTRUCTIONS_SECTION_LABELS.whatToDo} items={sections.whatToDo} />
        <InstructionSection title={TASK_INSTRUCTIONS_SECTION_LABELS.answerFormat} items={sections.answerFormat} />
        <InstructionSection
          title={TASK_INSTRUCTIONS_SECTION_LABELS.minimumRequirements}
          items={sections.minimumRequirements}
        />
        <InstructionSection title={TASK_INSTRUCTIONS_SECTION_LABELS.constraints} items={sections.constraints} />
      </div>
    </section>
  );
}
