"use client";

import { useEffect } from "react";
import type { ClientTestQuestion } from "@/lib/test-grading";

type Params = {
  enabled: boolean;
  question: ClientTestQuestion | undefined;
  index: number;
  total: number;
  onIndexChange: (next: number) => void;
  onSingle: (qid: string, aid: string) => void;
  onMultiToggle: (qid: string, aid: string) => void;
};

/** Клавиатура: ←/→ между вопросами, 1–9 — выбор варианта (не для TEXT). */
export function useTestTakingKeyboard({
  enabled,
  question,
  index,
  total,
  onIndexChange,
  onSingle,
  onMultiToggle,
}: Params) {
  useEffect(() => {
    if (!enabled || !question) return;

    function onKeyDown(e: KeyboardEvent) {
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        return;
      }

      if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault();
        onIndexChange(index - 1);
        return;
      }
      if (e.key === "ArrowRight" && index < total - 1) {
        e.preventDefault();
        onIndexChange(index + 1);
        return;
      }

      if (!question || question.questionType === "TEXT") return;

      const digit = Number(e.key);
      if (!Number.isInteger(digit) || digit < 1 || digit > 9) return;
      const answer = question.answers[digit - 1];
      if (!answer) return;

      e.preventDefault();
      if (question.questionType === "MULTIPLE_CHOICE" || question.questionType === "MATCHING") {
        onMultiToggle(question.id, answer.id);
      } else {
        onSingle(question.id, answer.id);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, question, index, total, onIndexChange, onSingle, onMultiToggle]);
}
