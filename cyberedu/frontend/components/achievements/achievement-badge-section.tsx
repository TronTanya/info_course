"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AchievementBadgeCard } from "@/components/achievements/achievement-badge-card";
import type { AchievementRow } from "@/lib/achievements";
import {
  scaleAchievementRank,
  sortAchievementsCatalogOrder,
  type AchievementBadgeGroup,
} from "@/lib/achievement-badge-ui";
import type { AchievementPanelProgress } from "@/lib/achievements-panel";
import { cn } from "@/lib/utils";

export function AchievementBadgeSection({
  group,
  defaultOpen = true,
  progressFor,
  className,
}: {
  group: AchievementBadgeGroup;
  defaultOpen?: boolean;
  progressFor?: (row: AchievementRow) => AchievementPanelProgress | null;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const rows = sortAchievementsCatalogOrder(group.rows);

  return (
    <section className={cn("ce-achievement-section", className)} aria-labelledby={panelId}>
      <button
        type="button"
        id={panelId}
        className="ce-achievement-section__head ce-touch-target flex w-full items-center justify-between gap-2 rounded-lg px-1 py-2 text-left transition hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-display text-base font-bold tracking-tight text-foreground sm:text-lg">
          {group.title}
        </span>
        <ChevronDown
          className={cn("size-5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      <div
        className={cn("ce-achievement-section__body", !open && "hidden")}
        role="list"
        aria-labelledby={panelId}
      >
        <ul className="ce-achievement-grid mt-2 list-none p-0">
          {rows.map((a) => {
            const progress = progressFor?.(a) ?? null;
            const rank = scaleAchievementRank(progress, a.unlocked);
            return (
              <li key={a.kind} role="listitem">
                <AchievementBadgeCard achievement={a} rank={rank} />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
