"use client";

import { AchievementGlyph } from "@/components/achievements/achievement-glyph";
import type { AchievementRow } from "@/lib/achievements";
import {
  ACHIEVEMENT_TIER_LABELS,
  getAchievementUiMeta,
  type AchievementTier,
} from "@/lib/achievement-badge-ui";
import { cn } from "@/lib/utils";

export type AchievementRankDisplay = {
  current: number;
  max: number;
  label: string;
};

function tierClass(tier: AchievementTier, unlocked: boolean): string {
  if (tier === "none") return "";
  if (!unlocked) return "ce-achievement-badge-card__tier--locked";
  if (tier === "junior") return "ce-achievement-badge-card__tier--junior";
  return "ce-achievement-badge-card__tier--mid";
}

export function AchievementBadgeCard({
  achievement: a,
  rank,
  className,
}: {
  achievement: AchievementRow;
  rank?: AchievementRankDisplay;
  className?: string;
}) {
  const meta = getAchievementUiMeta(a.kind);
  const tier = meta.tier;
  const tierLabel = tier !== "none" ? ACHIEVEMENT_TIER_LABELS[tier] : null;
  const rankLabel = rank?.label ?? (a.unlocked ? "Получен" : "Нет ранга");
  const hint = a.unlocked ? a.description : a.hintLocked;

  return (
    <article
      className={cn(
        "ce-achievement-badge-card",
        a.unlocked ? "ce-achievement-badge-card--unlocked" : "ce-achievement-badge-card--locked",
        className,
      )}
      title={hint}
    >
      <div className="ce-achievement-badge-card__icon-ring" aria-hidden>
        <AchievementGlyph
          slug={a.slug}
          unlocked={a.unlocked}
          size="md"
          className={cn(
            "ce-achievement-badge-card__glyph",
            !a.unlocked && "opacity-70 saturate-[0.35]",
          )}
        />
      </div>

      {tierLabel ? (
        <span className={cn("ce-achievement-badge-card__tier", tierClass(tier, a.unlocked))}>
          {tierLabel}
        </span>
      ) : null}

      <h4 className="ce-achievement-badge-card__title">{a.title}</h4>
      <p
        className={cn(
          "ce-achievement-badge-card__rank",
          a.unlocked && "ce-achievement-badge-card__rank--done",
        )}
      >
        {rankLabel}
      </p>
    </article>
  );
}
