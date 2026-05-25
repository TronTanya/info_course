import { assertAdminDataAccess } from "@/lib/admin-access";
import type { AdminHighFailTest } from "@/lib/course-health-panel-logic";
import type { AdminDifficultQuestion, AdminLowCompletionModule, AdminStuckPractice } from "@/lib/admin-lms-dashboard";
import {
  buildCourseHealthPanelData,
  type CourseHealthDropOffKind,
  type CourseHealthDropOffPoint,
  type CourseHealthPanelData,
  DROP_OFF_KIND_LABELS,
  moduleAdminHref,
} from "@/lib/course-health-panel-logic";
import { prisma } from "@/lib/db";

export type { CourseHealthPanelData } from "@/lib/course-health-panel-logic";
export { buildCourseHealthPanelData } from "@/lib/course-health-panel-logic";

export async function hasStudentLearningActivity(): Promise<boolean> {
  const students = await prisma.user.count({ where: { role: "USER" } });
  if (students === 0) return false;

  const [progressRows, attempts, submissions] = await Promise.all([
    prisma.progress.count({ where: { user: { role: "USER" } } }),
    prisma.testAttempt.count({ where: { user: { role: "USER" } } }),
    prisma.submission.count({
      where: { user: { role: "USER" }, status: { not: "DRAFT" } },
    }),
  ]);

  return progressRows + attempts + submissions > 0;
}

type ProgressDropOffBucket = {
  moduleId: string;
  kind: CourseHealthDropOffKind;
  count: number;
};

function classifyProgressDropOff(row: {
  lessonCompleted: boolean;
  testCompleted: boolean;
  practiceCompleted: boolean;
  videoCompleted: boolean;
  score: number;
}): CourseHealthDropOffKind | null {
  if (row.testCompleted && !row.practiceCompleted) return "practice";
  if (row.lessonCompleted && !row.testCompleted) return "test";
  if ((row.videoCompleted || row.score > 0) && !row.lessonCompleted) return "lesson";
  if (row.videoCompleted || row.score > 0 || row.lessonCompleted) return "module";
  return null;
}

export async function loadProgressDropOffPoints(): Promise<CourseHealthDropOffPoint[]> {
  const [progressRows, modules] = await Promise.all([
    prisma.progress.findMany({
      where: {
        moduleCompleted: false,
        user: { role: "USER" },
        module: { isActive: true },
      },
      select: {
        moduleId: true,
        lessonCompleted: true,
        testCompleted: true,
        practiceCompleted: true,
        videoCompleted: true,
        score: true,
      },
    }),
    prisma.module.findMany({
      where: { isActive: true },
      select: { id: true, title: true },
    }),
  ]);

  const moduleTitle = new Map(modules.map((m) => [m.id, m.title]));
  const buckets = new Map<string, ProgressDropOffBucket>();

  for (const row of progressRows) {
    const kind = classifyProgressDropOff(row);
    if (!kind) continue;
    const key = `${row.moduleId}:${kind}`;
    const cur = buckets.get(key) ?? { moduleId: row.moduleId, kind, count: 0 };
    cur.count += 1;
    buckets.set(key, cur);
  }

  return [...buckets.values()]
    .filter((b) => b.count >= 2)
    .map((b) => {
      const title = moduleTitle.get(b.moduleId) ?? "Модуль";
      return {
        id: `progress-${b.moduleId}-${b.kind}`,
        kind: b.kind,
        kindLabel: DROP_OFF_KIND_LABELS[b.kind],
        title,
        moduleTitle: title,
        stalledCount: b.count,
        href: moduleAdminHref(b.moduleId),
      };
    });
}

/** Тесты с высоким fail rate (агрегат по попыткам, без ответов студентов). */
export async function loadHighFailRateTests(
  minAttempts = 3,
  minFailRate = 35,
): Promise<AdminHighFailTest[]> {
  const attempts = await prisma.testAttempt.findMany({
    select: {
      testId: true,
      passed: true,
      test: { select: { id: true, title: true, module: { select: { title: true } } } },
    },
    take: 10_000,
    orderBy: { createdAt: "desc" },
  });

  const byTest = new Map<
    string,
    { passed: number; total: number; title: string; moduleTitle: string }
  >();

  for (const a of attempts) {
    const cur = byTest.get(a.testId) ?? {
      passed: 0,
      total: 0,
      title: a.test.title,
      moduleTitle: a.test.module.title,
    };
    cur.total += 1;
    if (a.passed) cur.passed += 1;
    byTest.set(a.testId, cur);
  }

  return [...byTest.entries()]
    .map(([testId, v]) => ({
      testId,
      title: v.title,
      moduleTitle: v.moduleTitle,
      attempts: v.total,
      failRatePercent: Math.round(((v.total - v.passed) / v.total) * 100),
    }))
    .filter((t) => t.attempts >= minAttempts && t.failRatePercent >= minFailRate)
    .sort((a, b) => b.failRatePercent - a.failRatePercent)
    .slice(0, 5);
}

export async function getCourseHealthPanelData(input?: {
  difficultModules?: AdminLowCompletionModule[];
  difficultQuestions?: AdminDifficultQuestion[];
  stuckPractices?: AdminStuckPractice[];
  highFailTests?: AdminHighFailTest[];
}): Promise<CourseHealthPanelData> {
  await assertAdminDataAccess();

  const hasStudentActivity = await hasStudentLearningActivity();
  if (!hasStudentActivity) {
    return buildCourseHealthPanelData({
      hasStudentActivity: false,
      lowCompletionModules: [],
      highFailTests: [],
      difficultQuestions: [],
      progressDropOff: [],
      stuckPractices: [],
    });
  }

  const [highFailTests, progressDropOff] = await Promise.all([
    input?.highFailTests ?? loadHighFailRateTests(),
    loadProgressDropOffPoints(),
  ]);

  return buildCourseHealthPanelData({
    hasStudentActivity: true,
    lowCompletionModules: input?.difficultModules ?? [],
    highFailTests,
    difficultQuestions: input?.difficultQuestions ?? [],
    progressDropOff,
    stuckPractices: input?.stuckPractices ?? [],
  });
}
