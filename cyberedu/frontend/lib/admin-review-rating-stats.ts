export type ReviewRatingStat = {
  stars: number;
  count: number;
  /** Доля от всех отзывов, 0–100 (целое). */
  percent: number;
};

const STAR_MIN = 1;
const STAR_MAX = 5;

/**
 * Агрегирует оценки 1–5 звёзд; значения вне диапазона приводятся к ближайшему целому в [1, 5].
 */
export function computeReviewRatingStats(
  ratings: ReadonlyArray<{ rating: number }>,
): ReviewRatingStat[] {
  const counts = [0, 0, 0, 0, 0];
  for (const { rating } of ratings) {
    let s = Math.round(Number(rating));
    if (!Number.isFinite(s)) s = 3;
    s = Math.min(STAR_MAX, Math.max(STAR_MIN, s));
    counts[s - 1] += 1;
  }
  const total = ratings.length;
  const stats: ReviewRatingStat[] = [];
  for (let stars = STAR_MIN; stars <= STAR_MAX; stars += 1) {
    const count = counts[stars - 1];
    const percent = total === 0 ? 0 : Math.round((count / total) * 100);
    stats.push({ stars, count, percent });
  }
  return stats;
}
