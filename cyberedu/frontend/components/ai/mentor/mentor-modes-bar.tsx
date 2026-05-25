"use client";

import { Shield } from "lucide-react";
import { getMentorModesForSurface, type MentorModeId } from "@/lib/ai/mentor-ui/modes";
import type { MentorSurface } from "@/lib/ai/mentor-ui/surfaces";
import { cn } from "@/lib/utils";

export function MentorModesBar({
  disabled,
  activeModeId,
  surface,
  onSelect,
  className,
}: {
  disabled?: boolean;
  activeModeId?: MentorModeId | null;
  surface: MentorSurface;
  onSelect: (modeId: MentorModeId) => void;
  className?: string;
}) {
  const modes = getMentorModesForSurface(surface);
  return (
    <div className={cn("ce-mentor-modes border-b border-cyan/10 px-3 py-2.5", className)}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Режимы</p>
        <p className="flex max-w-[11rem] items-center gap-1 text-right text-[10px] leading-snug text-muted-foreground">
          <Shield className="size-3 shrink-0 text-success" aria-hidden />
          Без ответов на тесты и практику
        </p>
      </div>
      <div
        className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="group"
        aria-label="Режимы наставника"
      >
        {modes.map((mode) => {
          const Icon = mode.icon;
          const active = activeModeId === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              disabled={disabled}
              title={mode.description}
              aria-pressed={active}
              aria-current={active ? "true" : undefined}
              onClick={() => onSelect(mode.id)}
              className={cn(
                "ce-touch-target flex min-w-[9.5rem] max-w-[12rem] shrink-0 flex-col gap-1 rounded-xl border px-3 py-2.5 text-left",
                "transition-[transform,border-color,box-shadow,background-color] duration-200",
                "hover:-translate-y-0.5 hover:border-cyan/40 hover:bg-cyan/10 hover:shadow-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "disabled:pointer-events-none disabled:opacity-50 motion-reduce:hover:translate-y-0",
                active
                  ? "border-cyan/45 bg-cyan/12 shadow-[0_0_20px_-8px_color-mix(in_oklab,var(--cyan)_45%,transparent)]"
                  : "border-[color-mix(in_oklab,var(--terminal-border)_70%,transparent)] bg-[color-mix(in_oklab,var(--terminal-bg-deep)_75%,transparent)]",
              )}
            >
              <span className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-foreground">
                <Icon className={cn("size-3.5 shrink-0", active ? "text-cyan" : "text-primary")} aria-hidden />
                {mode.label}
                {active ? (
                  <span className="rounded border border-cyan/40 bg-cyan/15 px-1 py-px font-mono text-[8px] uppercase tracking-wider text-cyan">
                    Выбрано
                  </span>
                ) : null}
              </span>
              <span className="line-clamp-2 text-[10px] leading-snug text-muted-foreground">{mode.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
