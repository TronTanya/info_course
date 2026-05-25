import type { AchievementKind } from "@prisma/client";
import { ACHIEVEMENT_CATALOG, type AchievementRow } from "@/lib/achievements";
import type { AchievementPanelProgress } from "@/lib/achievements-panel";

export type AchievementCategory = "progress" | "activity";

export type AchievementTier = "strong_middle" | "middle" | "junior" | "none";

export type AchievementUiMeta = {
  category: AchievementCategory;
  tier: AchievementTier;
};

const ACHIEVEMENT_UI_META: Record<AchievementKind, AchievementUiMeta> = {
  FIRST_MODULE_COMPLETE: { category: "progress", tier: "junior" },
  TWO_MODULES_COMPLETE: { category: "progress", tier: "junior" },
  THREE_MODULES_COMPLETE: { category: "progress", tier: "middle" },
  COURSE_HALF_COMPLETE: { category: "progress", tier: "middle" },
  ONE_MODULE_REMAINING: { category: "progress", tier: "strong_middle" },
  CERTIFICATE_EARNED: { category: "progress", tier: "strong_middle" },
  ALL_LESSONS_STUDIED: { category: "progress", tier: "strong_middle" },
  LESSON_STUDIED: { category: "progress", tier: "junior" },
  PHISHING_PRACTICE_PASSED: { category: "activity", tier: "middle" },
  PASSWORD_MODULE_COMPLETE: { category: "activity", tier: "middle" },
  LOG_INVESTIGATION_PASSED: { category: "activity", tier: "middle" },
  PRACTICE_SUBMITTED: { category: "activity", tier: "junior" },
  TEST_PASSED: { category: "activity", tier: "junior" },
  TEST_PERFECT_SCORE: { category: "activity", tier: "strong_middle" },
  TEST_RETRY: { category: "activity", tier: "junior" },
  AI_MENTOR_USED: { category: "activity", tier: "junior" },
  MENTOR_CHAT_ACTIVE: { category: "activity", tier: "middle" },
};

export const ACHIEVEMENT_CATEGORY_LABELS: Record<AchievementCategory, string> = {
  progress: "Прогресс обучения",
  activity: "Учебная активность",
};

export const ACHIEVEMENT_TIER_LABELS: Record<Exclude<AchievementTier, "none">, string> = {
  strong_middle: "Продвинутый",
  middle: "Средний",
  junior: "Новичок",
};

const RANK_SCALE_MAX = 5;

export function getAchievementUiMeta(kind: AchievementKind): AchievementUiMeta {
  return ACHIEVEMENT_UI_META[kind] ?? { category: "activity", tier: "junior" };
}

export function scaleAchievementRank(
  progress: AchievementPanelProgress | null | undefined,
  unlocked: boolean,
): { current: number; max: number; label: string } {
  if (unlocked) {
    return { current: RANK_SCALE_MAX, max: RANK_SCALE_MAX, label: `${RANK_SCALE_MAX}/${RANK_SCALE_MAX} ранг` };
  }
  if (!progress || progress.max <= 0) {
    return { current: 0, max: RANK_SCALE_MAX, label: "Нет ранга" };
  }
  const current = Math.min(
    RANK_SCALE_MAX,
    Math.max(0, Math.round((progress.value / progress.max) * RANK_SCALE_MAX)),
  );
  return { current, max: RANK_SCALE_MAX, label: `${current}/${RANK_SCALE_MAX} ранг` };
}

export type AchievementBadgeGroup = {
  id: AchievementCategory;
  title: string;
  rows: AchievementRow[];
};

export function groupAchievementsByCategory(rows: AchievementRow[]): AchievementBadgeGroup[] {
  const order: AchievementCategory[] = ["progress", "activity"];
  const buckets: Record<AchievementCategory, AchievementRow[]> = {
    progress: [],
    activity: [],
  };

  for (const row of rows) {
    const { category } = getAchievementUiMeta(row.kind);
    buckets[category].push(row);
  }

  return order
    .map((id) => ({
      id,
      title: ACHIEVEMENT_CATEGORY_LABELS[id],
      rows: buckets[id],
    }))
    .filter((g) => g.rows.length > 0);
}

/** Порядок как в каталоге — для стабильной сетки */
export function sortAchievementsCatalogOrder(rows: AchievementRow[]): AchievementRow[] {
  const index = new Map(ACHIEVEMENT_CATALOG.map((d, i) => [d.kind, i]));
  return [...rows].sort((a, b) => (index.get(a.kind) ?? 99) - (index.get(b.kind) ?? 99));
}
