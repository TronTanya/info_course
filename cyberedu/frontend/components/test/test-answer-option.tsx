"use client";

import { Check } from "lucide-react";
import { stateInteractiveClass } from "@/lib/design-system/ui-state";
import { cn } from "@/lib/utils";

export type TestAnswerOptionProps = {
  id: string;
  label: string;
  selected: boolean;
  mode: "single" | "multi";
  onSelect: () => void;
  disabled?: boolean;
  /** Только на экране результата */
  resultTone?: "correct" | "incorrect" | "neutral";
  /** Пояснение под вариантом (результат / проверка) */
  feedback?: string | null;
};

export function TestAnswerOption({
  id,
  label,
  selected,
  mode,
  onSelect,
  disabled,
  resultTone,
  feedback,
}: TestAnswerOptionProps) {
  const isResult = resultTone === "correct" || resultTone === "incorrect";
  const optionLabel =
    isResult && resultTone === "correct"
      ? `${label}, верно`
      : isResult && resultTone === "incorrect" && selected
        ? `${label}, неверно`
        : selected
          ? `${label}, выбран`
          : label;

  return (
    <div className="space-y-2">
    <button
      type="button"
      id={id}
      role={mode === "single" ? "radio" : "checkbox"}
      aria-checked={selected}
      aria-label={optionLabel}
      disabled={disabled}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "ce-test-option flex w-full min-h-[3.25rem] min-w-0 items-start gap-3 rounded-xl border px-4 py-3.5 text-left text-base leading-snug touch-manipulation max-md:min-h-14 max-md:py-4 max-md:text-[1.0625rem] max-md:leading-relaxed",
        stateInteractiveClass,
        selected && !isResult && "ce-test-option--selected border-primary/50 bg-primary/10 shadow-[0_0_0_1px_color-mix(in_oklab,var(--primary)_25%,transparent)]",
        !selected && !isResult && "border-border bg-muted/25 hover:border-primary/30 hover:bg-muted/40",
        resultTone === "correct" && "ce-test-option--correct border-success/45 bg-success/10",
        resultTone === "incorrect" && selected && "ce-test-option--incorrect border-danger/45 bg-danger/10",
        resultTone === "incorrect" && !selected && "border-border/60 bg-muted/15 opacity-80",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
          mode === "single" && "rounded-full",
          selected && !isResult && "border-primary bg-primary text-primary-foreground",
          !selected && !isResult && "border-muted-foreground/40 bg-card",
          resultTone === "correct" && "border-success bg-success text-success-foreground",
          resultTone === "incorrect" && selected && "border-danger bg-danger text-danger-foreground",
        )}
        aria-hidden
      >
        {selected ? <Check className="size-3" strokeWidth={3} /> : null}
      </span>
      <span className="min-w-0 flex-1 text-pretty pt-0.5 text-foreground">{label}</span>
    </button>
    {feedback && resultTone === "incorrect" && selected ? (
      <p className="rounded-lg border border-danger/30 bg-danger/8 px-3 py-2 text-sm text-muted-foreground">{feedback}</p>
    ) : null}
    </div>
  );
}
