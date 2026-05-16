-- =============================================================================
-- Таблица course_progress (PostgreSQL): фиктивные / реальные прохождения курса
-- См. Python: scripts/generate_fake_course_progress.py — генерация и INSERT
-- =============================================================================

CREATE TABLE IF NOT EXISTS course_progress (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    group_name TEXT NOT NULL,
    college TEXT NOT NULL,
    course TEXT NOT NULL,
    year INTEGER NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL,
    errors TEXT
);

CREATE INDEX IF NOT EXISTS ix_course_progress_group_name ON course_progress (group_name);
CREATE INDEX IF NOT EXISTS ix_course_progress_college ON course_progress (college);
CREATE INDEX IF NOT EXISTS ix_course_progress_course ON course_progress (course);
CREATE INDEX IF NOT EXISTS ix_course_progress_year ON course_progress (year);
CREATE INDEX IF NOT EXISTS ix_course_progress_completed_at ON course_progress (completed_at);

-- Связь с учётной записью Next/Prisma (после Alembic 0004 или prisma migrate course_progress_link_user):
--   user_id TEXT REFERENCES "User"("id") ON DELETE SET NULL
--   CREATE INDEX ix_course_progress_user_id ON course_progress (user_id);

-- -----------------------------------------------------------------------------
-- Пример INSERT (ошибки — JSON-массив строк «Ошибка 1» … или NULL)
-- -----------------------------------------------------------------------------

INSERT INTO course_progress (full_name, group_name, college, course, year, completed_at, errors)
VALUES (
    'Баиров Савва Данилович',
    'КИ-25',
    'Якутский гуманитарный колледж, группа КИ-25, 2 курс',
    'Основы информационной безопасности',
    2,
    NOW() AT TIME ZONE 'utc' - INTERVAL '12 days' + INTERVAL '2 hours',
    '["Ошибка 1", "Ошибка 2"]'
);

-- -----------------------------------------------------------------------------
-- Фильтрация: группа, колледж, курс, дата прохождения
-- -----------------------------------------------------------------------------

SELECT * FROM course_progress WHERE group_name = 'КИ-25' ORDER BY completed_at DESC;

SELECT * FROM course_progress
WHERE college ILIKE '%гуманитарный%'
ORDER BY completed_at DESC;

SELECT * FROM course_progress
WHERE course ILIKE '%информационной безопасности%'
ORDER BY completed_at DESC;

-- За последние 30 суток (как в генераторе Python)
SELECT * FROM course_progress
WHERE completed_at >= (NOW() AT TIME ZONE 'utc') - INTERVAL '30 days'
ORDER BY completed_at DESC;

-- Диапазон дат явно
SELECT id, full_name, group_name, completed_at, errors
FROM course_progress
WHERE completed_at >= '2026-04-01'::timestamptz
  AND completed_at < '2026-05-01'::timestamptz
ORDER BY completed_at;
