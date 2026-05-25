"use client";

import {
  AI_MODE_SELECTOR_ORDER,
  buildMentorModePrompt,
  getMentorModesForSurface,
  MENTOR_MODES,
  type MentorMode,
} from "@/lib/ai/mentor-ui/modes";
import type { MentorContextKind } from "@/lib/ai/mentor-ui/types";
import type { MentorSurface } from "@/lib/ai/mentor-ui/surfaces";
import type { AIMentorMode } from "@/types/ai-mentor";
import { cn } from "@/lib/utils";

export type AIModeSelectorProps = {
  surface: MentorSurface;
  contextKind: MentorContextKind;
  selectedModeId?: AIMentorMode | null;
  disabled?: boolean;
  onModeSelect: (modeId: AIMentorMode, starterPrompt: string) => void;
  allowedModeIds?: readonly AIMentorMode[];
  className?: string;
  variant?: "default" | "compact";
  layout?: "responsive" | "scroll" | "grid";
};

const modeById = new Map(MENTOR_MODES.map((m) => [m.id, m]));

function orderedModes(): MentorMode[] {
  return AI_MODE_SELECTOR_ORDER.map((id) => modeById.get(id)).filter(
    (m): m is MentorMode => m != null,
  );
}

function isModeAvailableOnSurface(mode: MentorMode, surface: MentorSurface): boolean {
  return getMentorModesForSurface(surface).some((m) => m.id === mode.id);
}

export function AIModeSelector({
  surface,
  contextKind,
  selectedModeId = null,
  disabled = false,
  onModeSelect,
  allowedModeIds,
  className,
  variant = "default",
  layout = "responsive",
}: AIModeSelectorProps) {
  const allowedSet = allowedModeIds ? new Set(allowedModeIds) : null;
  const modes = orderedModes().filter((m) => !allowedSet || allowedSet.has(m.id));

  if (variant === "compact") {
    return (
      <div className={cn("ce-ai-mode-selector ce-ai-mode-selector--compact", className)}>
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label="Режимы наставника"
        >
          {modes.map((mode) => {
            const active = selectedModeId === mode.id;
            const available = isModeAvailableOnSurface(mode, surface);
            return (
              <button
                key={mode.id}
                type="button"
                disabled={disabled || !available}
                title={mode.description}
                aria-pressed={active}
                onClick={() => {
                  if (!available || disabled) return;
                  onModeSelect(mode.id, buildMentorModePrompt(mode.id, contextKind));
                }}
                className={cn(
                  "ce-touch-target rounded-full border px-2.5 py-1 text-xs transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "disabled:pointer-events-none disabled:opacity-45",
                  active
                    ? "border-primary/40 bg-primary/10 font-medium text-foreground"
                    : "border-border/80 bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground",
                )}
              >
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const listClassName = cn(
    "ce-ai-mode-selector__list gap-2",
    layout === "grid" && "grid grid-cols-2",
    layout === "scroll" &&
      "flex overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    layout === "responsive" &&
      "flex overflow-x-auto pb-0.5 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] md:[scrollbar-width:auto] [&::-webkit-scrollbar]:hidden md:[&::-webkit-scrollbar]:auto",
  );

  return (
    <div className={cn("ce-ai-mode-selector border-b border-border/60 px-3 py-2.5", className)}>
      <p className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">Режимы</p>
      <div className={listClassName} role="group" aria-label="Режимы AI-наставника">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const active = selectedModeId === mode.id;
          const available = isModeAvailableOnSurface(mode, surface);

          return (
            <button
              key={mode.id}
              type="button"
              disabled={disabled || !available}
              title={
                available
                  ? mode.description
                  : `${mode.description} · недоступно на этой странице`
              }
              aria-pressed={active}
              aria-current={active ? "true" : undefined}
              onClick={() => {
                if (!available || disabled) return;
                onModeSelect(mode.id, buildMentorModePrompt(mode.id, contextKind));
              }}
              className={cn(
                "ce-ai-mode-chip ce-touch-target flex min-w-[8.75rem] shrink-0 flex-col gap-1 rounded-lg border px-2.5 py-2 text-left md:min-w-0",
                "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:pointer-events-none disabled:opacity-45",
                active
                  ? "border-primary/40 bg-primary/10"
                  : "border-border/70 bg-muted/20 hover:bg-muted/40",
              )}
            >
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
                <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                {mode.label}
              </span>
              <span className="line-clamp-2 text-[10px] leading-snug text-muted-foreground">
                {mode.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
