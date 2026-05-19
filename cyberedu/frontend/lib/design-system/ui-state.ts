import type { UiStatus } from "@/types/ui-status";

/** Визуальные варианты оболочки состояния (cyber UI). */
export type StateShellVariant = UiStatus | "neutral" | "disabled";

export const stateShellClass: Record<StateShellVariant, string> = {
  loading:
    "border-primary/25 bg-card/80 ring-1 ring-primary/15 shadow-[0_0_32px_-16px_color-mix(in_oklab,var(--primary)_35%,transparent)]",
  empty:
    "border-dashed border-border/80 bg-card/60 ring-1 ring-border/40 hover:border-primary/30",
  success:
    "border-success/35 bg-success/[0.08] ring-1 ring-success/20 shadow-[0_0_28px_-14px_color-mix(in_oklab,var(--success)_30%,transparent)]",
  error:
    "border-danger/35 bg-danger/[0.08] ring-1 ring-danger/20 shadow-[0_0_28px_-14px_color-mix(in_oklab,var(--danger)_28%,transparent)]",
  locked: "border-muted-foreground/35 bg-muted/25 ring-1 ring-border/50",
  completed:
    "border-success/30 bg-success/[0.06] ring-1 ring-success/15",
  in_progress:
    "border-primary/35 bg-primary/[0.08] ring-1 ring-primary/20 shadow-[0_0_24px_-12px_color-mix(in_oklab,var(--primary)_25%,transparent)]",
  pending: "border-cyan/30 bg-cyan/[0.06] ring-1 ring-cyan/15",
  warning: "border-warning/40 bg-warning/[0.08] ring-1 ring-warning/20",
  neutral: "border-border/70 bg-card/80 ring-1 ring-border/40",
  disabled: "border-border/50 bg-muted/20 opacity-70 ring-0",
};

/** Hover / focus / active для интерактивных карточек и кнопок-опций. */
export const stateInteractiveClass =
  "transition-[border-color,background,box-shadow,transform] duration-200 ease-[var(--ease-out-expo)] hover:border-primary/35 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] motion-reduce:active:scale-100 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:border-border disabled:hover:bg-transparent";

export const stateTerminalPrefix = "session@cyberedu";
