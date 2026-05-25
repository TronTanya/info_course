"use client";

import { BookOpen, Check, ClipboardCheck, FlaskConical, Lock, Trophy } from "lucide-react";
import type { ModuleHubStepKind, ModuleHubStepStatus } from "@/lib/module-hub-steps";
import { cn } from "@/lib/utils";

export type TestModulePathStep = {
  kind: ModuleHubStepKind;
  title: string;
  status: ModuleHubStepStatus;
  isActive: boolean;
};

const KIND_ICON: Record<ModuleHubStepKind, typeof BookOpen> = {
  lecture: BookOpen,
  video: BookOpen,
  test: ClipboardCheck,
  practice: FlaskConical,
  result: Trophy,
};

function statusLabel(status: ModuleHubStepStatus, isActive: boolean): string {
  if (isActive) return "Сейчас";
  if (status === "completed") return "Готово";
  if (status === "blocked") return "Закрыто";
  if (status === "available") return "Доступно";
  return "Далее";
}

export function TestModulePathStrip({ steps, className }: { steps: TestModulePathStep[]; className?: string }) {
  if (steps.length === 0) return null;

  return (
    <nav className={cn("ce-test-path-strip", className)} aria-label="Шаги модуля">
      <ol className="ce-scroll-x-contained flex min-w-min gap-2 pb-0.5">
        {steps.map((step) => {
          const Icon = KIND_ICON[step.kind];
          const done = step.status === "completed";
          const blocked = step.status === "blocked";
          return (
            <li key={step.kind}>
              <div
                className={cn(
                  "flex min-w-[7.5rem] max-w-[10rem] flex-col gap-1 rounded-xl border px-3 py-2 text-left transition-colors",
                  step.isActive && "border-primary/40 bg-primary/10 ring-1 ring-primary/20",
                  !step.isActive && done && "border-success/30 bg-success/5",
                  !step.isActive && !done && !blocked && "border-border/70 bg-muted/15",
                  blocked && !step.isActive && "border-dashed border-border/60 bg-muted/10 opacity-80",
                )}
                aria-current={step.isActive ? "step" : undefined}
              >
                <div className="flex items-center gap-1.5">
                  {blocked && !step.isActive ? (
                    <Lock className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  ) : done ? (
                    <Check className="size-3.5 shrink-0 text-success" aria-hidden />
                  ) : (
                    <Icon className="size-3.5 shrink-0 text-primary" aria-hidden />
                  )}
                  <span className="truncate text-xs font-semibold text-foreground">{step.title}</span>
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {statusLabel(step.status, step.isActive)}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
