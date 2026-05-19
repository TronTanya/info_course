"use client";

import { useEffect, useState } from "react";

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function PracticeLabTimer({ active = true }: { active?: boolean }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active) return;
    const t = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(t);
  }, [active]);

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-muted/40 px-2 py-1 font-mono text-xs tabular-nums text-foreground"
      title="Время в лаборатории (сессия)"
    >
      <span className="size-1.5 animate-pulse rounded-full bg-success motion-reduce:animate-none" aria-hidden />
      {formatElapsed(elapsed)}
    </span>
  );
}
