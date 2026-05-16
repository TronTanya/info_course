-- Новые типы вопросов (ситуация, сопоставление) и пояснение после проверки.
ALTER TYPE "QuestionType" ADD VALUE IF NOT EXISTS 'SITUATION';
ALTER TYPE "QuestionType" ADD VALUE IF NOT EXISTS 'MATCHING';

ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "explanation" TEXT;
