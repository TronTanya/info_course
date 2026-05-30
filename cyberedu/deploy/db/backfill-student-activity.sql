-- Разный прогресс / тесты / практики / сертификаты для каждого студента. Даты до 2026-04-01.
SET session_replication_role = replica;

DELETE FROM "TestAttemptAnswer"
WHERE "attemptId" IN (SELECT ta.id FROM "TestAttempt" ta JOIN "User" u ON u.id = ta."userId" WHERE u.role = 'USER');

DELETE FROM "TestAttempt" ta USING "User" u WHERE ta."userId" = u.id AND u.role = 'USER';
DELETE FROM "Submission" s USING "User" u WHERE s."userId" = u.id AND u.role = 'USER';
DELETE FROM "Certificate" c USING "User" u WHERE c."userId" = u.id AND u.role = 'USER';
DELETE FROM "UserAchievement" ua USING "User" u
WHERE ua."userId" = u.id AND u.role = 'USER' AND ua.kind = 'CERTIFICATE_EARNED';
DELETE FROM "Progress" p USING "User" u WHERE p."userId" = u.id AND u.role = 'USER';

SET session_replication_role = DEFAULT;

CREATE TEMP TABLE _bf_modules AS
SELECT m.id AS mid, m."orderNumber" AS ord, t.id AS tid, t."minScore" AS min_score,
       pt.id AS ptid, COALESCE(pt."maxScore", 100) AS max_score
FROM "Module" m
LEFT JOIN "Test" t ON t."moduleId" = m.id
LEFT JOIN "PracticalTask" pt ON pt."moduleId" = m.id
WHERE m."isActive" = true;

DO $$
DECLARE
  course_id text;
  u record;
  m record;
  mod_count int;
  mod_idx int;
  bucket int;
  tier int; -- 0 none, 1 partial, 2 full
  first_inc int;
  stage int;
  score int;
  t_ts timestamptz;
  base_ts timestamptz;
  issued_ts timestamptz;
  last_ts timestamptz;
  cap_ts timestamptz := timestamptz '2026-03-31 22:00:00+00';
  start_ts timestamptz := timestamptz '2026-01-15 08:00:00+00';
  prog_id text;
  att_id text;
  sub_id text;
  cert_id text;
  ach_id text;
  attempt_score int;
  sub_score int;
BEGIN
  SELECT id INTO course_id FROM "Course" ORDER BY "createdAt" ASC LIMIT 1;
  SELECT COUNT(DISTINCT mid) INTO mod_count FROM _bf_modules;

  FOR u IN
    SELECT id, email FROM "User"
    WHERE role = 'USER' AND email NOT ILIKE 'e2e-%'
    ORDER BY email
  LOOP
    IF u.email = 'student@cyberedu.local' THEN
      tier := 2;
    ELSE
      bucket := abs(hashtext(u.id || 'tier')) % 100;
      IF bucket < 28 THEN tier := 0;
      ELSIF bucket < 70 THEN tier := 1;
      ELSE tier := 2;
      END IF;
    END IF;

    IF tier = 0 THEN
      CONTINUE;
    END IF;

    IF tier = 1 THEN
      IF mod_count <= 1 THEN first_inc := 0;
      ELSE first_inc := abs(hashtext(u.id || 'inc')) % mod_count;
      END IF;
    ELSE
      first_inc := mod_count;
    END IF;

    base_ts := start_ts + ((abs(hashtext(u.id || 'tl')) % 20) || ' days')::interval;
    last_ts := base_ts;

    mod_idx := 0;
    FOR m IN SELECT * FROM _bf_modules ORDER BY ord LOOP
      IF tier = 1 AND mod_idx >= first_inc THEN
        stage := abs(hashtext(u.id || 'partial' || mod_idx::text)) % 5;
        score := CASE stage
          WHEN 0 THEN 0
          WHEN 1 THEN 8 + (abs(hashtext(u.id || 's1')) % 12)
          WHEN 2 THEN 18 + (abs(hashtext(u.id || 's2')) % 22)
          WHEN 3 THEN 35 + (abs(hashtext(u.id || 's3')) % 25)
          ELSE 52 + (abs(hashtext(u.id || 's4')) % 28)
        END;
        t_ts := GREATEST(last_ts - interval '2 hours', start_ts);

        prog_id := 'bfp' || substr(md5(u.id || m.mid || 'p'), 1, 22);
        INSERT INTO "Progress" (id, "userId", "moduleId", "lessonCompleted", "videoCompleted", "testCompleted", "practiceCompleted", "moduleCompleted", score, "createdAt", "updatedAt")
        VALUES (
          prog_id, u.id, m.mid,
          stage >= 1, stage >= 2, stage >= 3, stage >= 4 AND (abs(hashtext(u.id || 'pr')) % 3 = 0), false,
          score, t_ts, t_ts
        );

        IF stage >= 3 AND m.tid IS NOT NULL THEN
          attempt_score := LEAST(100, score + (abs(hashtext(u.id || m.tid)) % 8));
          att_id := 'bft' || substr(md5(u.id || m.tid || 'a'), 1, 22);
          INSERT INTO "TestAttempt" (id, "userId", "testId", score, "maxScore", passed, "createdAt")
          VALUES (att_id, u.id, m.tid, attempt_score, 100, attempt_score >= m.min_score, t_ts);
        END IF;

        IF stage >= 4 AND (abs(hashtext(u.id || 'pr')) % 3 = 0) AND m.ptid IS NOT NULL THEN
          sub_score := LEAST(m.max_score, score);
          sub_id := 'bfs' || substr(md5(u.id || m.ptid || 's'), 1, 22);
          INSERT INTO "Submission" (id, "userId", "practicalTaskId", "textAnswer", score, status, "createdAt", "updatedAt", "checkedAt")
          VALUES (sub_id, u.id, m.ptid, 'Ответ по практическому заданию (демо-данные курса).', sub_score, 'ACCEPTED', t_ts, t_ts, t_ts);
        END IF;

        EXIT;
      END IF;

      IF mod_idx > 0 THEN
        last_ts := last_ts + ((6 + (abs(hashtext(u.id || 'gap' || mod_idx::text)) % 36)) || ' hours')::interval;
      END IF;
      IF last_ts > cap_ts THEN
        last_ts := cap_ts - ((mod_count - 1 - mod_idx) * interval '25 minutes');
      END IF;
      t_ts := last_ts;

      score := 52 + (abs(hashtext(u.id || m.mid || mod_idx::text)) % 49);
      prog_id := 'bfp' || substr(md5(u.id || m.mid || 'p'), 1, 22);
      INSERT INTO "Progress" (id, "userId", "moduleId", "lessonCompleted", "videoCompleted", "testCompleted", "practiceCompleted", "moduleCompleted", score, "createdAt", "updatedAt")
      VALUES (prog_id, u.id, m.mid, true, true, true, true, true, score, t_ts, t_ts);

      IF m.tid IS NOT NULL THEN
        attempt_score := LEAST(100, score + (abs(hashtext(u.id || m.tid)) % 8));
        att_id := 'bft' || substr(md5(u.id || m.tid || 'a'), 1, 22);
        INSERT INTO "TestAttempt" (id, "userId", "testId", score, "maxScore", passed, "createdAt")
        VALUES (att_id, u.id, m.tid, attempt_score, 100, attempt_score >= m.min_score, t_ts);
      END IF;

      IF m.ptid IS NOT NULL THEN
        sub_score := LEAST(m.max_score, 70 + (abs(hashtext(u.id || m.ptid)) % 31));
        sub_id := 'bfs' || substr(md5(u.id || m.ptid || 's'), 1, 22);
        INSERT INTO "Submission" (id, "userId", "practicalTaskId", "textAnswer", score, status, "createdAt", "updatedAt", "checkedAt")
        VALUES (sub_id, u.id, m.ptid, 'Ответ по практическому заданию (демо-данные курса).', sub_score, 'ACCEPTED', t_ts, t_ts, t_ts);
      END IF;

      mod_idx := mod_idx + 1;
    END LOOP;

    IF tier = 2 THEN
      IF u.email = 'student@cyberedu.local' THEN
        issued_ts := timestamptz '2026-03-28 14:30:00+00';
      ELSE
        issued_ts := LEAST(last_ts + interval '1 day', cap_ts);
      END IF;
      cert_id := 'bfc' || substr(md5(u.id || 'cert'), 1, 22);
      INSERT INTO "Certificate" (id, "userId", "courseId", "certificateNumber", "verificationCode", "issuedAt")
      VALUES (
        cert_id, u.id, course_id,
        'CE-2026-' || upper(right(u.id, 10)),
        'VRFY-' || replace(u.id, '-', ''),
        issued_ts
      );
      ach_id := 'bfu' || substr(md5(u.id || 'ach'), 1, 22);
      INSERT INTO "UserAchievement" (id, "userId", kind, "unlockedAt")
      VALUES (ach_id, u.id, 'CERTIFICATE_EARNED', issued_ts)
      ON CONFLICT ("userId", kind) DO UPDATE SET "unlockedAt" = EXCLUDED."unlockedAt";
    END IF;
  END LOOP;
END $$;

DROP TABLE IF EXISTS _bf_modules;
