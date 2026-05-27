import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-border/80 bg-muted/50 px-1.5 py-0.5 font-mono text-2.5 text-foreground">
      {children}
    </kbd>
  );
}

/** Компактная подсказка по горячим клавишам на экране теста. */
export function TestKeyboardHintsBar({ className }: { className?: string }) {
  return (
    <p
      className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground", className)}
      id="test-keyboard-hint"
    >
      <span className="sr-only sm:not-sr-only sm:mr-0">Горячие клавиши:</span>
      <span className="inline-flex flex-wrap items-center gap-1.5">
        <Kbd>←</Kbd>
        <Kbd>→</Kbd>
        <span>между вопросами</span>
        <span className="text-border" aria-hidden>
          ·
        </span>
        <Kbd>1–9</Kbd>
        <span>выбор варианта</span>
      </span>
    </p>
  );
}
