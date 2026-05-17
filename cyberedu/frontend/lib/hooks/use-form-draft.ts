"use client";

import { useCallback, useEffect, useRef } from "react";

type UseFormDraftOptions<T> = {
  storageKey: string;
  value: T;
  onRestore: (value: T) => void;
  isDirty: boolean;
  enabled?: boolean;
  debounceMs?: number;
};

/**
 * Автосохранение черновика в sessionStorage и предупреждение при уходе со страницы.
 */
export function useFormDraft<T>({
  storageKey,
  value,
  onRestore,
  isDirty,
  enabled = true,
  debounceMs = 450,
}: UseFormDraftOptions<T>) {
  const hydrated = useRef(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        onRestore(JSON.parse(raw) as T);
      }
    } catch {
      // ignore corrupt draft
    }
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restore once per key
  }, [storageKey, enabled]);

  useEffect(() => {
    if (!enabled || !hydrated.current || !isDirty) return;
    const timer = window.setTimeout(() => {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(value));
      } catch {
        // quota / private mode
      }
    }, debounceMs);
    return () => window.clearTimeout(timer);
  }, [storageKey, value, isDirty, enabled, debounceMs]);

  useEffect(() => {
    if (!enabled || !isDirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty, enabled]);

  const clearDraft = useCallback(() => {
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }, [storageKey]);

  return { clearDraft };
}
