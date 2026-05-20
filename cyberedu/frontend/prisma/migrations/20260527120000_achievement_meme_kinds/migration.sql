-- Новые виды достижений (мем-бейджи). Должно выполняться после 20260523130000_user_achievements.
ALTER TYPE "AchievementKind" ADD VALUE IF NOT EXISTS 'AI_MENTOR_USED';
ALTER TYPE "AchievementKind" ADD VALUE IF NOT EXISTS 'COURSE_HALF_COMPLETE';
ALTER TYPE "AchievementKind" ADD VALUE IF NOT EXISTS 'TEST_PERFECT_SCORE';
