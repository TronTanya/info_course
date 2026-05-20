"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Trophy } from "lucide-react";
import { AchievementGlyph } from "@/components/achievements/achievement-glyph";
import type { AchievementRow } from "@/lib/achievements";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function DashboardAchievementsPreview({ rows }: { rows: AchievementRow[] }) {
  const reduce = useReducedMotion();
  const unlocked = rows.filter((r) => r.unlocked);
  const locked = rows.filter((r) => !r.unlocked);
  const highlight = unlocked.length > 0 ? unlocked[unlocked.length - 1] : locked[0];
  if (!highlight) return null;

  const unlockedCount = unlocked.length;

  return (
    <motion.section
      className="ce-learn-panel ce-glass rounded-2xl p-5 shadow-card sm:p-6"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      aria-labelledby="dash-achievements-title"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span
            className={cn(
              "flex size-16 shrink-0 items-center justify-center rounded-2xl p-0.5 ring-1",
              highlight.unlocked ? "bg-primary/12 ring-primary/25" : "bg-muted/60 ring-border",
            )}
          >
            <AchievementGlyph slug={highlight.slug} unlocked={highlight.unlocked} size="lg" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p id="dash-achievements-title" className="text-xs font-semibold uppercase tracking-wider text-cyan">
                Достижения
              </p>
              <Badge variant="outline" className="tabular-nums text-[10px]">
                {unlockedCount}/{rows.length}
              </Badge>
            </div>
            <p className="mt-1 font-semibold text-foreground">
              {highlight.unlocked ? `Открыто: ${highlight.title}` : `Цель: ${highlight.title}`}
            </p>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {highlight.unlocked ? highlight.description : highlight.hintLocked}
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/profile#achievements-heading"
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
    </motion.section>
  );
}
