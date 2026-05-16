-- Achievements (уникальная пара user + kind)

CREATE TYPE "AchievementKind" AS ENUM (
  'FIRST_MODULE_COMPLETE',
  'PHISHING_PRACTICE_PASSED',
  'PASSWORD_MODULE_COMPLETE',
  'LOG_INVESTIGATION_PASSED',
  'CERTIFICATE_EARNED'
);

CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "AchievementKind" NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserAchievement_userId_kind_key" ON "UserAchievement"("userId", "kind");

CREATE INDEX "UserAchievement_userId_idx" ON "UserAchievement"("userId");

ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
