import type { AdminDifficultQuestion, AdminLowCompletionModule, AdminStuckPractice } from "@/lib/admin-lms-dashboard";

export type AdminHighFailTest = {
  testId: string;
  title: string;
  moduleTitle: string;
  failRatePercent: number;
  attempts: number;
};

export const COURSE_HEALTH_EMPTY_MESSAGE =
  "Аналитика появится после активности студентов.";

export type CourseHealthLowCompletionModule = {
  moduleId: string;
  title: string;
  completionPercent: number;
  href: string;
};

export type CourseHealthHighFailTest = {
  testId: string;
  title: string;
  moduleTitle: string;
  failRatePercent: number;
  attempts: number;
  href: string;
};

export type CourseHealthDifficultTopic = {
  topicId: string;
  topic: string;
  moduleId: string;
  moduleTitle: string;
  mentionCount: number;
  href: string;
};

export type CourseHealthDropOffKind = "lesson" | "test" | "practice" | "module";

export type CourseHealthDropOffPoint = {
  id: string;
  kind: CourseHealthDropOffKind;
  kindLabel: string;
  title: string;
  moduleTitle: string;
  stalledCount: number;
  href: string;
};

export type CourseHealthPanelData = {
  hasStudentActivity: boolean;
  lowCompletionModules: CourseHealthLowCompletionModule[];
  highFailTests: CourseHealthHighFailTest[];
  difficultTopics: CourseHealthDifficultTopic[];
  dropOffPoints: CourseHealthDropOffPoint[];
};

const DROP_OFF_KIND_LABELS: Record<CourseHealthDropOffKind, string> = {
  lesson: "Урок",
  test: "Тест",
  practice: "Практика",
  module: "Модуль",
};

/** Публичный текст вопроса для агрегата — без ключей ответов (только stem). */
export function formatDifficultTopicLabel(questionText: string, maxLen = 120): string {
  const t = questionText.replace(/\s+/g, " ").trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1)}…`;
}

export function moduleAdminHref(moduleId: string): string {
  return `/admin/modules/${moduleId}/edit`;
}

export function testAdminHref(testId: string): string {
  return `/admin/tests/${testId}/edit`;
}

export function moduleLessonsAdminHref(moduleId: string): string {
  return moduleAdminHref(moduleId);
}

export function mapLowCompletionModules(modules: AdminLowCompletionModule[]): CourseHealthLowCompletionModule[] {
  return modules.map((m) => ({
    moduleId: m.moduleId,
    title: m.title,
    completionPercent: m.completionRatePercent,
    href: moduleAdminHref(m.moduleId),
  }));
}

export function mapHighFailTests(tests: AdminHighFailTest[]): CourseHealthHighFailTest[] {
  return tests.map((t) => ({
    testId: t.testId,
    title: t.title,
    moduleTitle: t.moduleTitle,
    failRatePercent: t.failRatePercent,
    attempts: t.attempts,
    href: testAdminHref(t.testId),
  }));
}

export function mapDifficultTopics(questions: AdminDifficultQuestion[]): CourseHealthDifficultTopic[] {
  return questions.map((q) => ({
    topicId: q.questionId,
    topic: formatDifficultTopicLabel(q.questionText),
    moduleId: q.moduleId,
    moduleTitle: q.moduleTitle,
    mentionCount: q.wrongCount,
    href: moduleLessonsAdminHref(q.moduleId),
  }));
}

export function mapStuckPracticesToDropOff(practices: AdminStuckPractice[]): CourseHealthDropOffPoint[] {
  return practices.map((p) => ({
    id: `practice-task-${p.taskId}`,
    kind: "practice" as const,
    kindLabel: DROP_OFF_KIND_LABELS.practice,
    title: p.title,
    moduleTitle: p.moduleTitle,
    stalledCount: p.stuckCount,
    href: `/admin/practical-tasks/${p.taskId}/edit`,
  }));
}

export function courseHealthPanelHasInsights(data: CourseHealthPanelData): boolean {
  return (
    data.lowCompletionModules.length > 0 ||
    data.highFailTests.length > 0 ||
    data.difficultTopics.length > 0 ||
    data.dropOffPoints.length > 0
  );
}

export function buildCourseHealthPanelData(input: {
  hasStudentActivity: boolean;
  lowCompletionModules: AdminLowCompletionModule[];
  highFailTests: AdminHighFailTest[];
  difficultQuestions: AdminDifficultQuestion[];
  progressDropOff: CourseHealthDropOffPoint[];
  stuckPractices: AdminStuckPractice[];
}): CourseHealthPanelData {
  const practiceDropOff = mapStuckPracticesToDropOff(input.stuckPractices);
  const dropOffPoints = mergeDropOffPoints(input.progressDropOff, practiceDropOff);

  return {
    hasStudentActivity: input.hasStudentActivity,
    lowCompletionModules: mapLowCompletionModules(input.lowCompletionModules),
    highFailTests: mapHighFailTests(input.highFailTests),
    difficultTopics: mapDifficultTopics(input.difficultQuestions),
    dropOffPoints,
  };
}

function mergeDropOffPoints(
  progress: CourseHealthDropOffPoint[],
  practice: CourseHealthDropOffPoint[],
): CourseHealthDropOffPoint[] {
  const merged = [...progress, ...practice];
  merged.sort((a, b) => b.stalledCount - a.stalledCount);
  const seen = new Set<string>();
  const out: CourseHealthDropOffPoint[] = [];
  for (const row of merged) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
    if (out.length >= 8) break;
  }
  return out;
}

export { DROP_OFF_KIND_LABELS };
