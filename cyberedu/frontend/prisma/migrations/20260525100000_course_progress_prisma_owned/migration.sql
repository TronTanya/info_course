-- course_progress: DDL владеет Prisma (backend — SQLAlchemy read/write без Alembic create_all).
CREATE TABLE IF NOT EXISTS course_progress (
    id SERIAL NOT NULL,
    full_name TEXT NOT NULL,
    group_name TEXT NOT NULL,
    college TEXT NOT NULL,
    course TEXT NOT NULL,
    year INTEGER NOT NULL,
    completed_at TIMESTAMPTZ(6) NOT NULL,
    errors TEXT,
    user_id TEXT,
    CONSTRAINT course_progress_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS ix_course_progress_group_name ON course_progress (group_name);
CREATE INDEX IF NOT EXISTS ix_course_progress_college ON course_progress (college);
CREATE INDEX IF NOT EXISTS ix_course_progress_course ON course_progress (course);
CREATE INDEX IF NOT EXISTS ix_course_progress_year ON course_progress (year);
CREATE INDEX IF NOT EXISTS ix_course_progress_completed_at ON course_progress (completed_at);

CREATE INDEX IF NOT EXISTS ix_course_progress_user_id ON course_progress (user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'course_progress_user_id_fkey'
  ) THEN
    ALTER TABLE course_progress
      ADD CONSTRAINT course_progress_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
