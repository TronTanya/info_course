"use client";

import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { AchievementGlyph } from "@/components/achievements/achievement-glyph";
import { CockpitWidget, CockpitWidgetHeader } from "@/components/dashboard/cockpit/cockpit-widget";
import type { AchievementRow } from "@/lib/achievements";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function DashboardAchievementsPreview({ rows }: { rows: AchievementRow[] }) {
  const unlocked = rows.filter((r) => r.unlocked);
  const locked = rows.filter((r) => !r.unlocked);
  const highlight = unlocked.length > 0 ? unlocked[unlocked.length - 1] : locked[0];
  if (!highlight) return null;

  const unlockedCount = unlocked.length;

  return (
    <CockpitWidget variant="default" delay={0.1} aria-labelledby="dash-achievements-title">
      <CockpitWidgetHeader
        titleId="dash-achievements-title"
        eyebrow="Награды"
        title="Достижения"
        action={
          <Badge variant="outline" className="tabular-nums text-2.5">
            {unlockedCount}/{rows.length}
          </Badge>
        }
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span
            className={cn(
              "flex size-16 shrink-0 items-center justify-center rounded-2xl p-0.5 ring-1 shadow-ce-glow-soft",
              highlight.unlocked ? "bg-primary/12 ring-primary/25" : "bg-muted/60 ring-border",
            )}
          >
            <AchievementGlyph slug={highlight.slug} unlocked={highlight.unlocked} size="lg" />
          </span>
          <div className="min-w-0">
            <p className="mt-1 font-semibold text-foreground">
              {highlight.unlocked ? `Открыто: ${highlight.title}` : `Цель: ${highlight.title}`}
            </p>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {highlight.unlocked ? highlight.description : highlight.hintLocked}
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/profile?tab=achievements"
          className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-xl border border-primary/25 bg-primary/8 px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/12 sm:self-center"
        >
          <Trophy className="size-4" aria-hidden />
          Все бейджи
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <ul className="mt-4 flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
        {rows.map((a) => (
          <li
            key={a.kind}
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-xl border p-0.5 transition-colors",
              a.unlocked ? "border-primary/30 bg-primary/10" : "border-border/60 bg-muted/30",
            )}
            title={a.title}
          >
            <AchievementGlyph slug={a.slug} unlocked={a.unlocked} size="sm" />
          </li>
        ))}
      </ul>
    </CockpitWidget>
  );
}
