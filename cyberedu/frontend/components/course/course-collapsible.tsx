"use client";

import { useCallback, useId, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type CourseCollapsibleProps = {
  summary: ReactNode;
  children: ReactNode;
  /** Управляемое состояние (timeline). */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  summaryClassName?: string;
  contentClassName?: string;
  panelId?: string;
};

/**
 * Обёртка над &lt;details&gt; с aria-expanded / aria-controls для screen reader.
 */
export function CourseCollapsible({
  summary,
  children,
  open: openControlled,
  defaultOpen = false,
  onOpenChange,
  className,
  summaryClassName,
  contentClassName,
  panelId: panelIdProp,
}: CourseCollapsibleProps) {
  const autoId = useId();
  const panelId = panelIdProp ?? `course-collapsible-panel-${autoId.replace(/:/g, "")}`;
  const [openUncontrolled, setOpenUncontrolled] = useState(defaultOpen);
  const isControlled = openControlled !== undefined;
  const isOpen = isControlled ? openControlled : openUncontrolled;

  const handleToggle = useCallback(
    (next: boolean) => {
      if (!isControlled) setOpenUncontrolled(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  return (
    <details
      className={className}
      open={isOpen}
      onToggle={(e) => handleToggle(e.currentTarget.open)}
    >
      <summary
        className={cn(
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
          summaryClassName,
        )}
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        {summary}
      </summary>
      <div id={panelId} className={contentClassName}>
        {children}
      </div>
    </details>
  );
}
