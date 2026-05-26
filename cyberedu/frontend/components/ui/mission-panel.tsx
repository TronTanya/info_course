import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "ce-mission-panel",
  accent: "ce-mission-panel border-primary/30",
  cyan: "ce-mission-panel border-cyan/30",
} as const;

export type MissionPanelProps = {
  className?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
  variant?: keyof typeof variants;
};

/** Панель миссии / следующего шага — premium CTA block. */
export function MissionPanel({
  className,
  eyebrow,
  title,
  description,
  children,
  actions,
  variant = "default",
}: MissionPanelProps) {
  return (
    <section className={cn(variants[variant], "relative p-5 sm:p-6", className)} aria-labelledby="mission-panel-title">
      <div className="relative z-1 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-2">
          {eyebrow ? <p className="typo-eyebrow text-primary">{eyebrow}</p> : null}
          <h2 id="mission-panel-title" className="typo-h2 text-balance">
            {title}
          </h2>
          {description ? <p className="typo-body-muted max-w-xl text-pretty">{description}</p> : null}
          {children ? <div className="pt-1">{children}</div> : null}
        </div>
        {actions ? <div className="relative z-1 flex shrink-0 flex-wrap gap-2 lg:justify-end">{actions}</div> : null}
      </div>
    </section>
  );
}
