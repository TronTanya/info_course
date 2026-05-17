import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { getModuleAction, getUiStatus } from "@/lib/course-path-ui";

export type DashboardStepMetrics = {
  lessonsDone: number;
  lessonsTotal: number;
  testsDone: number;
  testsTotal: number;
  practiceDone: number;
  practiceTotal: number;
};

export type DashboardUpcomingTask = {
  id: string;
  kind: "lesson" | "test" | "practice";
  title: string;
  moduleTitle: string;
  href: string;
  priority: number;
};

export type DashboardActivityItem = {
  id: string;
  kind: "lesson" | "test" | "practice";
  label: string;
  detail: string;
  at: string;
  meta?: string;
};

export function computeStepMetrics(modules: CourseProgressModuleRow[]): DashboardStepMetrics {
  let lessonsDone = 0;
  let lessonsTotal = 0;
  let testsDone = 0;
  let testsTotal = 0;
  let practiceDone = 0;
  let practiceTotal = 0;

  for (const row of modules) {
    const { requirements: req, progress: p } = row;
    if (req.lessonRequired) {
      lessonsTotal++;
      if (p?.lessonCompleted) lessonsDone++;
    }
    if (req.testRequired) {
      testsTotal++;
      if (p?.testCompleted) testsDone++;
    }
    if (req.practiceRequired) {
      practiceTotal++;
      if (p?.practiceCompleted) practiceDone++;
    }
  }

  return { lessonsDone, lessonsTotal, testsDone, testsTotal, practiceDone, practiceTotal };
}

export function buildRecentActivities(stats: ProfileCourseStats): DashboardActivityItem[] {
  const items: DashboardActivityItem[] = [];

  if (stats.lastLesson) {
    items.push({
      id: "lesson",
      kind: "lesson",
      label: "Лекция",
      detail: stats.lastLesson.lessonTitle,
      at: stats.lastLesson.at,
      meta: stats.lastLesson.moduleTitle,
    });
  }
  if (stats.lastTest) {
    items.push({
      id: "test",
      kind: "test",
      label: "Тест",
      detail: stats.lastTest.testTitle,
      at: stats.lastTest.at,
      meta: `${stats.lastTest.moduleTitle} · ${stats.lastTest.passed ? "зачёт" : "попытка"} ${stats.lastTest.percent}%`,
    });
  }
  if (stats.lastPractice) {
    items.push({
      id: "practice",
      kind: "practice",
      label: "Практика",
      detail: stats.lastPractice.taskTitle,
      at: stats.lastPractice.at,
      meta: `${stats.lastPractice.moduleTitle} · ${stats.lastPractice.statusLabel}`,
    });
  }

  return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export function buildUpcomingTasks(modules: CourseProgressModuleRow[]): DashboardUpcomingTask[] {
  const tasks: DashboardUpcomingTask[] = [];

  for (const row of modules) {
    if (!row.unlocked || row.moduleCompleted) continue;
    const { requirements: req, progress: p } = row;
    const base = `/dashboard/course/${row.module.id}`;
    const order = row.module.orderNumber;

    if (req.lessonRequired && !p?.lessonCompleted) {
      tasks.push({
        id: `${row.module.id}-lesson`,
        kind: "lesson",
        title: "Пройти лекцию",
        moduleTitle: row.module.title,
        href: `${base}/lesson`,
        priority: order * 10,
      });
      continue;
    }
    if (req.testRequired && !p?.testCompleted) {
      tasks.push({
        id: `${row.module.id}-test`,
        kind: "test",
        title: "Сдать тест",
        moduleTitle: row.module.title,
        href: `${base}/test`,
        priority: order * 10 + 1,
      });
      continue;
    }
    if (req.practiceRequired && !p?.practiceCompleted) {
      tasks.push({
        id: `${row.module.id}-practice`,
        kind: "practice",
        title: "Выполнить практику",
        moduleTitle: row.module.title,
        href: `${base}/practice`,
        priority: order * 10 + 2,
      });
    }
  }

  return tasks.sort((a, b) => a.priority - b.priority).slice(0, 5);
}

export function findCurrentModuleRow(
  modules: CourseProgressModuleRow[],
  currentModuleId: string | null,
): CourseProgressModuleRow | null {
  if (!currentModuleId) return null;
  return modules.find((m) => m.module.id === currentModuleId) ?? null;
}

/** Первый разблокированный модуль, который ещё не завершён (для карты курса). */
export function findFocusModule(modules: CourseProgressModuleRow[]): CourseProgressModuleRow | null {
  return modules.find((m) => m.unlocked && !m.moduleCompleted) ?? null;
}

export function getContinueFromModules(
  modules: CourseProgressModuleRow[],
  courseTitle: string,
): { href: string; label: string; hint: string } {
  const allDone = modules.length > 0 && modules.every((m) => m.moduleCompleted);
  if (allDone) {
    return {
      href: "/dashboard/certificate",
      label: "Перейти к сертификату",
      hint: "Все модули пройдены — оформите сертификат.",
    };
  }

  const focus = findFocusModule(modules);
  if (!focus) {
    return {
      href: "/dashboard/course",
      label: "Продолжить обучение",
      hint: `Курс «${courseTitle}»: выберите доступный модуль ниже.`,
    };
  }

  const action = getModuleAction(focus);
  return {
    href: action.disabled ? `/dashboard/course/${focus.module.id}` : action.href,
    label: "Продолжить обучение",
    hint: `Модуль ${focus.module.orderNumber}: «${focus.module.title}».`,
  };
}

export function getContinueTarget(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
): { href: string; label: string; title: string; subtitle: string } {
  if (stats.allModulesComplete) {
    return {
      href: "/dashboard/certificate",
      label: "Перейти к сертификату",
      title: "Курс пройден",
      subtitle: "Оформите сертификат или повторите материалы в карте курса.",
    };
  }

  const row = findCurrentModuleRow(modules, stats.currentModuleId);
  if (row) {
    const action = getModuleAction(row);
    return {
      href: action.disabled ? "/dashboard/course" : action.href,
      label: "Продолжить обучение",
      title: row.module.title,
      subtitle: `Модуль ${row.module.orderNumber} · ${action.label}`,
    };
  }

  return {
    href: "/dashboard/course",
    label: "Продолжить обучение",
    title: stats.courseTitle,
    subtitle: "Откройте карту курса и начните с первого доступного модуля.",
  };
}

export function welcomeStatusLabel(stats: ProfileCourseStats): string {
  if (stats.allModulesComplete) return "Курс завершён — осталось оформить результат";
  if (stats.currentModuleTitle) return `Сейчас: ${stats.currentModuleTitle}`;
  return "Начните с карты курса";
}

export { getUiStatus };
