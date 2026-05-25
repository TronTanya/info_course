"use client";

import { useEffect, useRef, useState } from "react";
import { formatTestTimerDisplay } from "@/lib/test-taking";

export type TestTakingDisplayTimer = {
  remainingSec: number | null;
  label: string | null;
  remainingPct: number | null;
  isLow: boolean;
  isCritical: boolean;
  expired: boolean;
};

const IDLE: TestTakingDisplayTimer = {
  remainingSec: null,
  label: null,
  remainingPct: null,
  isLow: false,
  isCritical: false,
  expired: false,
};

/**
 * Клиентский таймер только для UX. Источник истины по зачёту — сервер при submit.
 */
export function useTestTakingDisplayTimer({
  enabled,
  startedAtMs,
  durationSeconds,
  onExpire,
}: {
  enabled: boolean;
  startedAtMs: number | null;
  durationSeconds: number | null;
  onExpire: () => void;
}): TestTakingDisplayTimer {
  const [display, setDisplay] = useState<TestTakingDisplayTimer>(IDLE);
  const firedRef = useRef(false);

  const active = enabled && startedAtMs != null && durationSeconds != null && durationSeconds > 0;

  useEffect(() => {
    firedRef.current = false;
  }, [startedAtMs, durationSeconds]);

  useEffect(() => {
    if (!active || startedAtMs == null || durationSeconds == null) return;

    const tick = () => {
      const endMs = startedAtMs + durationSeconds * 1000;
      const remainingMs = Math.max(0, endMs - Date.now());
      const remainingSec = Math.ceil(remainingMs / 1000);
      const expired = remainingSec <= 0;
      const sec = expired ? 0 : remainingSec;

      setDisplay({
        remainingSec: sec,
        label: formatTestTimerDisplay(sec),
        remainingPct: Math.min(100, Math.max(0, Math.round((remainingMs / (durationSeconds * 1000)) * 100))),
        isLow: !expired && sec > 0 && sec <= 120,
        isCritical: !expired && sec > 0 && sec <= 30,
        expired,
      });

      if (expired && !firedRef.current) {
        firedRef.current = true;
        onExpire();
      }
    };

    queueMicrotask(tick);
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [active, startedAtMs, durationSeconds, onExpire]);

  if (!active) return IDLE;
  return display;
}
