/**
 * Загрузка курса в Supabase через Management API (supabase db query --linked).
 * Используйте, если `npx prisma db seed` не подключается к pooler с Windows.
 */
import { execSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dir, "..", "..", "..");

const COURSE_ID = "clseedcourse00001";
const COURSE_TITLE = "Основы информационной безопасности";
const COURSE_DESC =
  "Спокойный ввод в ИБ для колледжа: как думать о рисках, что делать в типичных ситуациях и как не навредить себе и данным.";

const MODULES = [
  "Модуль 1. Основы информационной безопасности",
  "Модуль 2. Пароли и двухфакторная аутентификация",
  "Модуль 3. Фишинг и социальная инженерия",
  "Модуль 4. Безопасность устройств",
  "Модуль 5. Безопасность в интернете",
  "Модуль 6. Основы Linux и сетей",
  "Модуль 7. Криптография для новичков",
  "Модуль 8. Итоговое расследование",
];

function esc(s) {
  return s.replace(/'/g, "''");
}

function runSql(sql) {
  const tmp = join(__dir, "_seed_tmp.sql");
  writeFileSync(tmp, sql, "utf8");
  try {
    execSync(`supabase db query --linked -f "${tmp}"`, {
      cwd: projectRoot,
      stdio: "inherit",
      encoding: "utf8",
    });
  } finally {
    try {
      unlinkSync(tmp);
    } catch {
      /* ignore */
    }
  }
}

const parts = [];
parts.push(`-- CyberEdu minimal course seed via Supabase CLI
DELETE FROM "Progress";
DELETE FROM "Submission";
DELETE FROM "TestAttemptAnswer";
DELETE FROM "TestAttempt";
DELETE FROM "Answer";
DELETE FROM "Question";
DELETE FROM "Test";
DELETE FROM "PracticalTask";
DELETE FROM "Lesson";
DELETE FROM "Module";
DELETE FROM "Course";
`);

parts.push(`
INSERT INTO "Course" (id, title, description, hours, "createdAt", "updatedAt")
VALUES (
  '${COURSE_ID}',
  '${esc(COURSE_TITLE)}',
  '${esc(COURSE_DESC)}',
  36,
  NOW(),
  NOW()
);
`);

for (let i = 0; i < MODULES.length; i++) {
  const n = i + 1;
  const modId = `clseedmod${String(n).padStart(2, "0")}`;
  const lessonId = `clseedles${String(n).padStart(2, "0")}`;
  const testId = `clseedtest${String(n).padStart(2, "0")}`;
  const qId = `clseedq${String(n).padStart(2, "0")}`;
  const a1 = `clseeda${String(n).padStart(2, "0")}a`;
  const a2 = `clseeda${String(n).padStart(2, "0")}b`;
  const taskId = `clseedprac${String(n).padStart(2, "0")}`;
  const title = MODULES[i];

  parts.push(`
INSERT INTO "Module" (id, "courseId", title, description, "orderNumber", "isActive", "createdAt", "updatedAt")
VALUES (
  '${modId}',
  '${COURSE_ID}',
  '${esc(title)}',
  'Учебный модуль ${n} курса «${esc(COURSE_TITLE)}».',
  ${n},
  true,
  NOW(),
  NOW()
);

INSERT INTO "Lesson" (id, "moduleId", title, content, "videoUrl", "allowAiAdaptation", "createdAt", "updatedAt")
VALUES (
  '${lessonId}',
  '${modId}',
  'Лекция: ${esc(title)}',
  '# ${esc(title)}\n\nКраткая учебная лекция. Материал будет дополнен полным seed при стабильном подключении Prisma.',
  NULL,
  true,
  NOW(),
  NOW()
);

INSERT INTO "Test" (id, "moduleId", title, "minScore", "createdAt", "updatedAt")
VALUES (
  '${testId}',
  '${modId}',
  'Контроль: ${esc(title)}',
  70,
  NOW(),
  NOW()
);

INSERT INTO "Question" (id, "testId", "questionText", "questionType", points, "orderNumber", "textManualGrading")
VALUES (
  '${qId}',
  '${testId}',
  'Информационная безопасность — это только установка антивируса?',
  'TRUE_FALSE',
  1,
  1,
  false
);

INSERT INTO "Answer" (id, "questionId", "answerText", "isCorrect") VALUES
  ('${a1}', '${qId}', 'Верно', false),
  ('${a2}', '${qId}', 'Неверно', true);

INSERT INTO "PracticalTask" (
  id, "moduleId", title, description, "taskType", "checkType", "maxScore",
  "minLength", "createdAt", "updatedAt"
) VALUES (
  '${taskId}',
  '${modId}',
  'Практика: модуль ${n}',
  'Кратко опишите один вывод из лекции (не менее 10 символов).',
  'TEXT_ANSWER',
  'MANUAL',
  10,
  10,
  NOW(),
  NOW()
);
`);
}

parts.push(`
INSERT INTO "Profile" (
  id, "userId", "lastName", "firstName", "middleName", "birthDate",
  "educationalInstitution", city, specialty, interests, "createdAt", "updatedAt"
)
SELECT
  'clseedprofadmin01',
  u.id,
  'Админов',
  'Админ',
  'Админович',
  '1990-01-01'::date,
  'CyberEdu — администрирование платформы',
  'Якутск',
  'Администратор',
  'платформа, аудит, LMS',
  NOW(),
  NOW()
FROM "User" u WHERE u.email = 'admin@cyberedu.local'
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "Profile" (
  id, "userId", "lastName", "firstName", "middleName", "birthDate",
  "educationalInstitution", city, specialty, interests, "createdAt", "updatedAt"
)
SELECT
  'clseedprofstud01',
  u.id,
  'Студентов',
  'Студент',
  'Демович',
  '2005-06-15'::date,
  'ГАПОУ «ЯКСИТ», группа КИ-25, 2 курс',
  'Якутск',
  'Программист',
  'кибербезопасность, сети',
  NOW(),
  NOW()
FROM "User" u WHERE u.email = 'student@cyberedu.local'
ON CONFLICT ("userId") DO NOTHING;
`);

const sql = parts.join("\n");
console.log("Запуск seed через supabase db query --linked …");
runSql(sql);
console.log("Готово: курс, 8 модулей, лекции, тесты, практика, профили.");
