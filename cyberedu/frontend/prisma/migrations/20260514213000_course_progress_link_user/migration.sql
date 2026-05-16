-- Связь course_progress с учёткой Prisma ("User"). Идемпотентно.
-- Полная DDL таблицы — migration 20260525100000_course_progress_prisma_owned.
DO $$
BEGIN
  IF to_regclass('public.course_progress') IS NULL THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'course_progress'
      AND column_name = 'user_id'
  ) THEN
    RETURN;
  END IF;

  ALTER TABLE course_progress ADD COLUMN user_id TEXT;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'ix_course_progress_user_id'
  ) THEN
    CREATE INDEX ix_course_progress_user_id ON course_progress (user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'course_progress_user_id_fkey'
  ) THEN
    ALTER TABLE course_progress
      ADD CONSTRAINT course_progress_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
