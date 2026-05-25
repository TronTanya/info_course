"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { AchievementBadgeSection } from "@/components/achievements/achievement-badge-section";
import type { AchievementRow } from "@/lib/achievements";
import { groupAchievementsByCategory } from "@/lib/achievement-badge-ui";
import { deriveProgressToAchievement } from "@/lib/achievements-panel";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/ui/circular-progress";
/** Сколько открытых бейджей показывать до «Показать все». */
export const ACHIEVEMENTS_PREVIEW_UNLOCKED = 4;

export function ProfileAchievementsPanel({
  rows,
  viewer = "self",
  studentFirstName,
  showCourseLink = true,
  stats = null,
  modules = [],
}: {
  rows: AchievementRow[];
  viewer?: "self" | "other";
  studentFirstName?: string;
  showCourseLink?: boolean;
  stats?: ProfileCourseStats | null;
  modules?: CourseProgressModuleRow[];
}) {
  const reduce = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const unlockedCount = rows.filter((r) => r.unlocked).length;
  const unlockedRows = useMemo(() => rows.filter((r) => r.unlocked), [rows]);
  const percent = rows.length > 0 ? Math.round((unlockedCount / rows.length) * 100) : 0;
  const nextLocked = rows.find((r) => !r.unlocked);

  const displayRows = expanded ? rows : unlockedRows.slice(0, ACHIEVEMENTS_PREVIEW_UNLOCKED);
  const hiddenCount = expanded ? 0 : rows.length - displayRows.length;
  const showToggle = expanded || hiddenCount > 0;
  const groups = groupAchievementsByCategory(displayRows);

  const subtitle =
    viewer === "other"
      ? `Открыто ${unlockedCount} из ${rows.length}${studentFirstName ? ` у ${studentFirstName}` : ""}.`
      : `${unlockedCount} из ${rows.length} открыто — остальные по мере прохождения курса.`;

  return (
    <section className="space-y-4 p-4 sm:p-5" aria-labelledby="achievements-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <motion.div
          className="min-w-0 flex-1"
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="typo-eyebrow text-primary">Мотивация</p>
          <h3 id="achievements-heading" className="mt-0.5 text-base font-semibold text-foreground sm:text-lg">
            {viewer === "other" ? "Трофеи" : "Достижения"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          {nextLocked && !expanded ? (
            <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
              Дальше: <span className="font-medium text-foreground">{nextLocked.title}</span>
            </p>
          ) : null}
        </motion.div>
        <div className="flex shrink-0 items-center gap-2">
          <CircularProgress
            value={percent}
            size={56}
            strokeWidth={5}
            tone={percent >= 100 ? "success" : "cyan"}
            label="Открыто"
          />
          <Badge variant="primary" className="h-7 tabular-nums text-xs">
            {unlockedCount}/{rows.length}
          </Badge>
        </div>
      </div>

      <div className="ce-achievements-board space-y-5" aria-live="polite">
        {groups.length > 0 ? (
          groups.map((group) => (
            <AchievementBadgeSection
              key={group.id}
              group={group}
              defaultOpen
              progressFor={(row) => deriveProgressToAchievement(row, stats, modules)}
            />
          ))
        ) : (
          <p className="rounded-xl border border-dashed border-border/80 bg-muted/10 px-3 py-4 text-center text-sm text-muted-foreground">
            Пока нет открытых бейджей. Пройдите модуль или спросите наставника.
          </p>
        )}

        {showToggle ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 w-full gap-1.5 text-muted-foreground hover:text-foreground"
            aria-expanded={expanded}
            aria-controls="achievements-grid"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? (
              <>
                Свернуть
                <ChevronDown className="size-4 rotate-180" aria-hidden />
              </>
            ) : (
              <>
                Показать все бейджи
                <span className="tabular-nums text-primary">+{hiddenCount}</span>
                <ChevronDown className="size-4" aria-hidden />
              </>
            )}
          </Button>
        ) : null}
      </div>

      {showCourseLink ? (
        <div className="flex justify-end border-t border-border/60 pt-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/course">К карте курса</Link>
          </Button>
        </div>
      ) : null}
    </section>
  );
}
