/**
 * Общие Tailwind-классы примитивов UI (дизайн-система v2.1).
 * Используйте в компонентах `components/ui/*` для единообразия.
 */
export const transitionBase =
  "transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-200 ease-[var(--ease-out-expo)] motion-reduce:transition-none";

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export const focusRingInset =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset";

export const interactiveScale =
  "active:scale-[0.98] motion-reduce:active:scale-100";

export const cardSurface =
  "rounded-2xl border border-border bg-card text-card-foreground shadow-card";

export const cardInteractive =
  `${cardSurface} ${transitionBase} hover:border-primary/20 hover:shadow-[var(--shadow-card-hover)]`;

export const inputSurface =
  `flex w-full min-h-11 rounded-2xl border border-border bg-card px-3 py-2.5 text-base text-foreground shadow-sm sm:text-sm placeholder:text-subtle-foreground ${transitionBase} hover:border-primary/25 ${focusRing} disabled:cursor-not-allowed disabled:opacity-50`;

export const badgeBase =
  `inline-flex items-center rounded-xl border px-2.5 py-0.5 text-xs font-medium ${transitionBase}`;
