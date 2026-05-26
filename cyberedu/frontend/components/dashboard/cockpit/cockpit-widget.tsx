"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const variants = {
  default: "ce-cockpit-panel",
  glow: "ce-cockpit-panel ce-cockpit-panel--glow",
  accent: "ce-cockpit-panel ce-cockpit-panel--accent",
  terminal: "ce-cockpit-panel ce-cockpit-panel--terminal",
  mission: "ce-cockpit-panel ce-cockpit-mission",
} as const;

export type CockpitWidgetProps = {
  children: React.ReactNode;
  className?: string;
  variant?: keyof typeof variants;
  padding?: "none" | "md";
  /** Hover lift — только для кликабельных карточек-обёрток */
  interactive?: boolean;
  animate?: boolean;
  delay?: number;
  id?: string;
  "aria-labelledby"?: string;
};

export function CockpitWidget({
  children,
  className,
  variant = "default",
  padding = "md",
  interactive = false,
  animate = true,
  delay = 0,
  id,
  "aria-labelledby": labelledBy,
}: CockpitWidgetProps) {
  const reduce = useReducedMotion();
  const bodyClass = padding === "md" ? "ce-cockpit-panel__body" : "";

  const content = (
    <section
      id={id}
      className={cn(
        variants[variant],
        interactive && "ce-cockpit-panel--interactive",
        "min-w-0",
        className,
      )}
      aria-labelledby={labelledBy}
    >
      <div className={bodyClass}>{children}</div>
    </section>
  );

  if (!animate || reduce) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1], delay: Math.min(delay, 0.12) }}
      className="min-w-0"
    >
      {content}
    </motion.div>
  );
}

export function CockpitWidgetHeader({
  eyebrow,
  title,
  titleId,
  action,
  className,
}: {
  eyebrow?: string;
  title?: string;
  /** Связь с `aria-labelledby` у родительского `CockpitWidget`. */
  titleId?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("ce-cockpit-panel__header", className)}>
      <div className="min-w-0 space-y-1">
        {eyebrow ? <p className="ce-cockpit-eyebrow">{eyebrow}</p> : null}
        {title ? (
          <h2 id={titleId} className="font-heading text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h2>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
