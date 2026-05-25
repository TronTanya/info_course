"use client";

import { useEffect, useMemo, useState } from "react";
import { buildOpenedFlagsFromVisited } from "@/lib/test-question-navigator";

/** Отслеживает, какие вопросы пользователь уже открывал (для QuestionNavigator). */
export function useTestOpenedFlags(total: number, currentIndex: number): boolean[] {
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- накопление посещённых вопросов для навигатора
    setVisited((prev) => {
      const next = new Set(prev);
      next.add(currentIndex);
      return next;
    });
  }, [currentIndex]);

  return useMemo(
    () => buildOpenedFlagsFromVisited(total, currentIndex, visited),
    [total, currentIndex, visited],
  );
}
