"use client";

import { MENTOR_MODES, type MentorModeId } from "@/lib/ai/mentor-ui/modes";
import { cn } from "@/lib/utils";

export function MentorModesBar({
  disabled,
  onSelect,
  className,
}: {
  disabled?: boolean;
  onSelect: (modeId: MentorModeId) => void;
  className?: string;
}) {
  return (
    <div className={cn("ce-mentor-modes border-b px-3 py-2", className)} role="group" aria-label="Режимы наставника">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Режимы</p>
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {MENTOR_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            disabled={disabled}
            title={mode.description}
            onClick={() => onSelect(mode.id)}
            className={cn(
              "ce-touch-target shrink-0 rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-colors",
              "border-border/80 bg-muted/20 text-foreground hover:border-cyan/35 hover:bg-cyan/10",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:opacity-50",
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
}
