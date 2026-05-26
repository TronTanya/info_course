import type { UiStatus } from "@/types/ui-status";

/** Визуальные варианты оболочки состояния (cyber UI). */
export type StateShellVariant = UiStatus | "neutral" | "disabled";

export const stateShellClass: Record<StateShellVariant, string> = {
  loading:
    "border-primary/25 bg-card/80 ring-1 ring-primary/15 shadow-card",
  empty:
    "border-dashed border-border/80 bg-card/60 ring-1 ring-border/40 hover:border-primary/30",
  success:
    "border-success/35 bg-success/8 ring-1 ring-success/20 shadow-card",
  error:
    "border-danger/35 bg-danger/8 ring-1 ring-danger/20 shadow-card",
  locked: "border-muted-foreground/35 bg-muted/25 ring-1 ring-border/50",
  completed:
    "border-success/30 bg-success/6 ring-1 ring-success/15",
  in_progress:
    "border-primary/35 bg-primary/8 ring-1 ring-primary/20 shadow-card",
  pending: "border-cyan/30 bg-cyan/6 ring-1 ring-cyan/15",
  warning: "border-warning/40 bg-warning/8 ring-1 ring-warning/20",
  neutral: "border-border/70 bg-card/80 ring-1 ring-border/40",
  disabled: "border-border/50 bg-muted/20 opacity-70 ring-0",
};

/** Hover / focus / active для интерактивных карточек и кнопок-опций. */
export const stateInteractiveClass =
  "transition-colors transition-shadow transition-transform duration-200 ease-out-expo hover:border-primary/35 hover:bg-muted/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-99 motion-reduce:active:scale-100 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:border-border disabled:hover:bg-transparent";

export const stateTerminalPrefix = "session@cyberedu";
