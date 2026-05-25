"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Lock, Target, Trophy } from "lucide-react";
import { AchievementBadgeSection } from "@/components/achievements/achievement-badge-section";
import { AchievementGlyph } from "@/components/achievements/achievement-glyph";
import type { AchievementRow } from "@/lib/achievements";
import { groupAchievementsByCategory } from "@/lib/achievement-badge-ui";
import {
  ACHIEVEMENTS_PANEL_EMPTY,
  buildAchievementsPanelView,
  deriveProgressToAchievement,
} from "@/lib/achievements-panel";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/ui/circular-progress";
import { EmptyState } from "@/components/ui/empty-state";
import { PremiumCard } from "@/components/ui/premium-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { motionPresets, motionWithReducedMotion } from "@/lib/design-system/motion";
import { cn } from "@/lib/utils";

function EarnedBadgeStrip({
  rows,
  stats,
  modules,
}: {
  rows: AchievementRow[];
  stats: ProfileCourseStats | null;
  modules: CourseProgressModuleRow[];
}) {
  if (rows.length === 0) return null;
  const groups = groupAchievementsByCategory(rows);

  return (
    <div className="ce-achievements-board space-y-4" aria-labelledby="achievements-earned-heading">
      <h3 id="achievements-earned-heading" className="text-sm font-semibold text-foreground">
        Полученные бейджи
      </h3>
      {groups.map((group) => (
        <AchievementBadgeSection
          key={group.id}
          group={group}
          defaultOpen
          progressFor={(row) => deriveProgressToAchievement(row, stats, modules)}
        />
      ))}
    </div>
  );
}

function NextBadgeCard({
  next,
  progressLabel,
  progressValue,
  progressMax,
}: {
  next: AchievementRow;
  progressLabel: string | null;
  progressValue: number;
  progressMax: number;
}) {
  const hasProgress = progressMax > 0 && progressLabel != null;

  return (
    <article className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        <span className="relative flex size-16 shrink-0 items-center justify-center rounded-2xl border border-border/80 bg-muted/30 p-1">
          <AchievementGlyph slug={next.slug} unlocked={false} size="lg" className="opacity-80 saturate-[0.45]" />
          <span
            className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground"
            aria-hidden
          >
            <Lock className="size-3.5" />
          </span>
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Target className="size-4 text-primary" aria-hidden />
            <h3 className="text-xs font-semibold uppercase tracking-wide text-primary">Ближайший бейдж</h3>
          </div>
          <p className="font-display text-lg font-semibold text-foreground">{next.title}</p>
          <p className="text-sm text-pretty text-muted-foreground">{next.hintLocked}</p>
          {hasProgress ? (
            <ProgressBar
              className="max-w-md pt-1"
              label={progressLabel}
              value={progressValue}
              max={progressMax}
            />
          ) : (
            <p className="text-xs text-muted-foreground">
              Прогресс появится, когда выполните шаги курса для этого бейджа.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export type AchievementsPanelProps = {
  rows: AchievementRow[];
  stats?: ProfileCourseStats | null;
  modules?: CourseProgressModuleRow[];
  className?: string;
};

export function AchievementsPanel({ rows, stats = null, modules = [], className }: AchievementsPanelProps) {
  const reduce = useReducedMotion();
  const view = buildAchievementsPanelView(rows, stats, modules);

  if (view.catalogEmpty) {
    return (
      <PremiumCard as="section" variant="default" padding="md" className={cn("min-w-0", className)}>
        <h2 className="typo-eyebrow text-primary">Достижения</h2>
        <EmptyState
          compact
          className="mt-3"
          title={ACHIEVEMENTS_PANEL_EMPTY.title}
          description={ACHIEVEMENTS_PANEL_EMPTY.description}
          action={
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/course">Открыть курс</Link>
            </Button>
          }
        />
      </PremiumCard>
    );
  }

  return (
    <motion.div {...motionWithReducedMotion(motionPresets.slideUp, reduce)}>
      <PremiumCard
        as="section"
        variant="glow"
        padding="md"
        className={cn("relative min-w-0 overflow-hidden", className)}
        aria-labelledby="achievements-panel-heading"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <h2 id="achievements-panel-heading" className="typo-eyebrow text-primary">
              Достижения
            </h2>
            <p className="text-sm text-muted-foreground">
              {view.unlockedCount > 0
                ? `${view.unlockedCount} бейджей открыто — только подтверждённые в системе.`
                : ACHIEVEMENTS_PANEL_EMPTY.title}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <CircularProgress
              value={view.catalogPercent}
              size={56}
              strokeWidth={5}
              tone={view.catalogPercent >= 100 ? "success" : "default"}
              label="Каталог"
            />
            <Badge variant="outline" className="tabular-nums text-xs">
              {view.unlockedCount}/{view.totalCount}
            </Badge>
          </div>
        </div>

        {view.unlocked.length > 0 ? (
          <div className="mt-5">
            <EarnedBadgeStrip rows={view.unlocked} stats={stats} modules={modules} />
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-border/80 bg-muted/15 px-4 py-3 text-sm text-pretty text-muted-foreground">
            {ACHIEVEMENTS_PANEL_EMPTY.description}
          </p>
        )}

        {view.next ? (
          <div className={cn(view.unlocked.length > 0 && "mt-6 border-t border-border/70 pt-6")}>
            <NextBadgeCard
              next={view.next}
              progressLabel={view.nextProgress?.label ?? null}
              progressValue={view.nextProgress?.value ?? 0}
              progressMax={view.nextProgress?.max ?? 0}
            />
          </div>
        ) : null}

        <div className="mt-5 flex justify-end border-t border-border/60 pt-4">
          <Button asChild variant="outline" size="sm" className="min-h-10 touch-manipulation">
            <Link href="/dashboard/profile#achievements-heading">
              <Trophy className="size-4" aria-hidden />
              Все бейджи
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </PremiumCard>
    </motion.div>
  );
}

/** @deprecated Используйте `AchievementsPanel`. */
export const DashboardAchievementsPreview = AchievementsPanel;
