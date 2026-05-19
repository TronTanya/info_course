"use client";

import { Crosshair, Radio } from "lucide-react";
import type { MentorContextKind } from "@/lib/ai/mentor-ui/types";
import { buildContextChips } from "@/lib/ai/mentor-ui/context";
import type { MentorContextLabels } from "@/lib/ai/mentor-ui/types";

const kindLabel: Record<MentorContextKind, string> = {
  lesson: "Лекция",
  practice: "Практика",
  module: "Модуль",
  general: "Общий контекст",
};

export function MentorContextBar({
  kind,
  labels,
  moduleId,
}: {
  kind: MentorContextKind;
  labels: MentorContextLabels;
  moduleId?: string | null;
}) {
  const chips = buildContextChips(kind, labels, moduleId);

  return (
    <div className="ce-mentor-context border-b px-3 py-2">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-cyan/80">
        <Radio className="size-3 animate-pulse" aria-hidden />
        <span>Context lock</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-foreground/80">{kindLabel[kind]}</span>
      </div>
      {chips.length > 0 ? (
        <ul className="mt-1.5 flex flex-wrap gap-1">
          {chips.map((c) => (
            <li
              key={c.id}
              className="inline-flex max-w-full items-center gap-1 truncate rounded-md border border-cyan/20 bg-cyan/5 px-2 py-0.5 text-[11px] text-foreground/90"
              title={c.label}
            >
              <Crosshair className="size-3 shrink-0 text-cyan/70" aria-hidden />
              <span className="truncate">{c.label}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
