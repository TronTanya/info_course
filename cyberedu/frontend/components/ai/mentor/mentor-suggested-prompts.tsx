"use client";

import { Sparkles } from "lucide-react";
import type { SuggestedPrompt } from "@/lib/ai/mentor-ui/suggested-prompts";

export function MentorSuggestedPrompts({
  prompts,
  disabled,
  onSelect,
}: {
  prompts: SuggestedPrompt[];
  disabled?: boolean;
  onSelect: (text: string) => void;
}) {
  if (!prompts.length) return null;

  return (
    <div className="ce-mentor-prompts px-3 pb-2">
      <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        <Sparkles className="size-3 text-cyan" aria-hidden />
        Быстрые запросы
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {prompts.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(p.text)}
            className="shrink-0 rounded-lg border border-cyan/20 bg-cyan/5 px-3 py-2 text-left text-xs text-foreground transition hover:border-cyan/40 hover:bg-cyan/10 disabled:opacity-50"
          >
            <span className="block font-medium">{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
