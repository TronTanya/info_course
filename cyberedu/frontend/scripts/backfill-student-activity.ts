/**
 * Заполнение Supabase: у каждого студента свой прогресс, тесты, практики, активность, сертификаты.
 * Все даты строго до 2026-04-01. Запуск: npx tsx scripts/backfill-student-activity.ts
 */
import "../lib/00-init-prisma-env";
import { Role } from "@prisma/client";
import { prisma } from "../lib/db";

const STUDENT_EMAIL = "student@cyberedu.local";
const BEFORE_APRIL_2026 = Date.UTC(2026, 2, 31, 22, 0, 0); // 2026-03-31 22:00 UTC
const TIMELINE_START_EARLIEST = Date.UTC(2026, 0, 15, 8, 0, 0); // 2026-01-15

function demoHashUint32(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

type ProgressTier = "none" | "partial" | "full";

function progressTier(email: string, userId: string): ProgressTier {
  if (email === STUDENT_EMAIL) return "full";
  const bucket = demoHashUint32(`${userId}|progressTier`) % 100;
  if (bucket < 28) return "none";
  if (bucket < 70) return "partial";
  return "full";
}

function partialFirstIncomplete(userId: string, moduleCount: number): number {
  if (moduleCount <= 1) return 0;
  return demoHashUint32(`${userId}|incompleteIdx`) % moduleCount;
}

function partialModuleFlags(userId: string, moduleIndex: number) {
  const h = demoHashUint32(`${userId}|partial|${moduleIndex}`);
  const stage = h % 5;
  if (stage === 0) {
    return {
      lessonCompleted: false,
      videoCompleted: false,
      testCompleted: false,
      practiceCompleted: false,
      moduleCompleted: false,
      score: 0,
    };
  }
  if (stage === 1) {
    return {
      lessonCompleted: true,
      videoCompleted: false,
      testCompleted: false,
      practiceCompleted: false,
      moduleCompleted: false,
      score: 8 + (h % 12),
    };
  }
  if (stage === 2) {
    return {
      lessonCompleted: true,
      videoCompleted: true,
      testCompleted: false,
      practiceCompleted: false,
      moduleCompleted: false,
      score: 18 + (h % 22),
    };
  }
  if (stage === 3) {
    return {
      lessonCompleted: true,
      videoCompleted: true,
      testCompleted: true,
      practiceCompleted: false,
      moduleCompleted: false,
      score: 35 + (h % 25),
    };
  }
  return {
    lessonCompleted: true,
    videoCompleted: true,
    testCompleted: true,
    practiceCompleted: (h % 3) === 0,
    moduleCompleted: false,
    score: 52 + (h % 28),
  };
}

function scoreForModule(userId: string, moduleId: string, moduleIndex: number): number {
  const h = demoHashUint32(`${userId}|${moduleId}|m${moduleIndex}`);
  return 52 + (h % 49);
}

/** Шкала завершения модулей: январь — 31 марта 2026 (до апреля). */
function moduleTimeline(userId: string, moduleCount: number): Date[] {
  const salt = demoHashUint32(`${userId}|preApr2026`);
  let t = TIMELINE_START_EARLIEST + (salt % 20) * 24 * 3600 * 1000;
  const out: Date[] = [];
  for (let i = 0; i < moduleCount; i++) {
    if (i > 0) {
      const gapHours = 6 + (demoHashUint32(`${userId}|gap|${i}`) % 36);
      t += gapHours * 3600 * 1000;
    }
    if (t > BEFORE_APRIL_2026) {
      t = BEFORE_APRIL_2026 - (moduleCount - 1 - i) * 25 * 60 * 1000;
    }
    out.push(new Date(t));
  }
  for (let i = 1; i < out.length; i++) {
    if (out[i]!.getTime() <= out[i - 1]!.getTime()) {
      out[i] = new Date(out[i - 1]!.getTime() + 50 * 60 * 1000);
    }
  }
  return out;
}

function certificateIssuedAt(userId: string, lastModuleAt: Date): Date {
  const bump = (12 + (demoHashUint32(`${userId}|cert`) % 72)) * 3600 * 1000;
  return new Date(Math.min(lastModuleAt.getTime() + bump, BEFORE_APRIL_2026));
}

async function main() {
  const course = await prisma.course.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } });
  if (!course) throw new Error("Course not found");

  const modules = await prisma.module.findMany({
    where: { courseId: course.id, isActive: true },
    orderBy: { orderNumber: "asc" },
    select: {
      id: true,
      tests: { select: { id: true, minScore: true } },
      practicalTasks: { select: { id: true, maxScore: true } },
    },
  });
  if (modules.length === 0) throw new Error("No active modules");

  const students = await prisma.user.findMany({
    where: {
      role: Role.USER,
      NOT: { email: { startsWith: "e2e-", mode: "insensitive" } },
    },
    select: { id: true, email: true },
    orderBy: { email: "asc" },
  });

  console.log(`Students: ${students.length}, modules: ${modules.length}`);

  const studentIds = students.map((s) => s.id);
  const moduleIds = modules.map((m) => m.id);

  console.log("Clearing old activity...");
  await prisma.testAttemptAnswer.deleteMany({
    where: { attempt: { userId: { in: studentIds } } },
  });
  await prisma.testAttempt.deleteMany({ where: { userId: { in: studentIds } } });
  await prisma.submission.deleteMany({ where: { userId: { in: studentIds } } });
  await prisma.certificate.deleteMany({ where: { userId: { in: studentIds } } });
  await prisma.userAchievement.deleteMany({
    where: { userId: { in: studentIds }, kind: "CERTIFICATE_EARNED" },
  });
  await prisma.progress.deleteMany({ where: { userId: { in: studentIds } } });

  let noneN = 0;
  let partialN = 0;
  let fullN = 0;
  let certN = 0;
  let attemptN = 0;
  let submissionN = 0;

  for (const user of students) {
    const tier = progressTier(user.email, user.id);
    const timeline = moduleTimeline(user.id, modules.length);

    if (tier === "none") {
      noneN += 1;
      continue;
    }

    const progressRows: Parameters<typeof prisma.progress.createMany>[0]["data"] = [];
    const testRows: Parameters<typeof prisma.testAttempt.createMany>[0]["data"] = [];
    const submissionRows: Parameters<typeof prisma.submission.createMany>[0]["data"] = [];

    if (tier === "full") {
      fullN += 1;
      for (let i = 0; i < modules.length; i++) {
        const mod = modules[i]!;
        const at = timeline[i]!;
        const score = scoreForModule(user.id, mod.id, i);
        progressRows.push({
          userId: user.id,
          moduleId: mod.id,
          lessonCompleted: true,
          videoCompleted: true,
          testCompleted: true,
          practiceCompleted: true,
          moduleCompleted: true,
          score,
          createdAt: at,
          updatedAt: at,
        });
        for (const test of mod.tests) {
          const maxScore = 100;
          const attemptScore = Math.min(100, score + (demoHashUint32(`${user.id}|t|${test.id}`) % 8));
          testRows.push({
            userId: user.id,
            testId: test.id,
            score: attemptScore,
            maxScore,
            passed: attemptScore >= test.minScore,
            createdAt: at,
          });
        }
        for (const task of mod.practicalTasks) {
          const pts = task.maxScore > 0 ? task.maxScore : 100;
          submissionRows.push({
            userId: user.id,
            practicalTaskId: task.id,
            textAnswer: "Ответ по практическому заданию (демо-данные курса).",
            score: Math.min(pts, 70 + (demoHashUint32(`${user.id}|p|${task.id}`) % 31)),
            status: "ACCEPTED",
            createdAt: at,
            updatedAt: at,
            checkedAt: at,
          });
        }
      }
    } else {
      partialN += 1;
      const firstIncomplete = partialFirstIncomplete(user.id, modules.length);
      for (let i = 0; i < firstIncomplete; i++) {
        const mod = modules[i]!;
        const at = timeline[i]!;
        const score = scoreForModule(user.id, mod.id, i);
        progressRows.push({
          userId: user.id,
          moduleId: mod.id,
          lessonCompleted: true,
          videoCompleted: true,
          testCompleted: true,
          practiceCompleted: true,
          moduleCompleted: true,
          score,
          createdAt: at,
          updatedAt: at,
        });
        for (const test of mod.tests) {
          const maxScore = 100;
          const attemptScore = Math.min(100, score);
          testRows.push({
            userId: user.id,
            testId: test.id,
            score: attemptScore,
            maxScore,
            passed: attemptScore >= test.minScore,
            createdAt: at,
          });
        }
        for (const task of mod.practicalTasks) {
          const pts = task.maxScore > 0 ? task.maxScore : 100;
          submissionRows.push({
            userId: user.id,
            practicalTaskId: task.id,
            textAnswer: "Ответ по практическому заданию (демо-данные курса).",
            score: Math.min(pts, 75 + (demoHashUint32(`${user.id}|p|${task.id}`) % 26)),
            status: "ACCEPTED",
            createdAt: at,
            updatedAt: at,
            checkedAt: at,
          });
        }
      }
      const mod = modules[firstIncomplete];
      if (mod) {
        const flags = partialModuleFlags(user.id, firstIncomplete);
        const base = timeline[firstIncomplete]!;
        const activityAt = new Date(
          Math.max(base.getTime() - (2 + (demoHashUint32(user.id) % 6)) * 3600 * 1000, TIMELINE_START_EARLIEST),
        );
        progressRows.push({
          userId: user.id,
          moduleId: mod.id,
          ...flags,
          createdAt: activityAt,
          updatedAt: activityAt,
        });
        if (flags.testCompleted) {
          for (const test of mod.tests) {
            const maxScore = 100;
            const attemptScore = flags.score;
            testRows.push({
              userId: user.id,
              testId: test.id,
              score: attemptScore,
              maxScore,
              passed: attemptScore >= test.minScore,
              createdAt: activityAt,
            });
          }
        }
        if (flags.practiceCompleted) {
          for (const task of mod.practicalTasks) {
            const pts = task.maxScore > 0 ? task.maxScore : 100;
            submissionRows.push({
              userId: user.id,
              practicalTaskId: task.id,
              textAnswer: "Ответ по практическому заданию (демо-данные курса).",
              score: Math.min(pts, flags.score),
              status: "ACCEPTED",
              createdAt: activityAt,
              updatedAt: activityAt,
              checkedAt: activityAt,
            });
          }
        }
      }
    }

    if (progressRows.length) await prisma.progress.createMany({ data: progressRows });
    if (testRows.length) {
      await prisma.testAttempt.createMany({ data: testRows });
      attemptN += testRows.length;
    }
    if (submissionRows.length) {
      await prisma.submission.createMany({ data: submissionRows });
      submissionN += submissionRows.length;
    }

    const allDone =
      tier === "full" &&
      modules.every((_, i) => progressRows.some((r) => r.moduleId === modules[i]!.id && r.moduleCompleted));

    if (allDone) {
      const lastAt = timeline[timeline.length - 1]!;
      const issuedAt =
        user.email === STUDENT_EMAIL
          ? new Date(Date.UTC(2026, 2, 28, 14, 30, 0))
          : certificateIssuedAt(user.id, lastAt);
      await prisma.certificate.create({
        data: {
          userId: user.id,
          courseId: course.id,
          certificateNumber: `CE-2026-${user.id.slice(-10).toUpperCase()}`,
          verificationCode: `VRFY-${user.id.replace(/-/g, "").slice(0, 22)}`,
          issuedAt,
        },
      });
      await prisma.userAchievement.create({
        data: { userId: user.id, kind: "CERTIFICATE_EARNED", unlockedAt: issuedAt },
      });
      certN += 1;
    }
  }

  console.log(
    `Done. none=${noneN} partial=${partialN} full=${fullN} | attempts=${attemptN} submissions=${submissionN} certificates=${certN}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
