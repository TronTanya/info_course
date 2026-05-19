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

export type DashboardNextStepCard = {
  kind: "lesson" | "test" | "practice";
  title: string;
  moduleTitle: string;
  href: string;
  statusLabel: string;
  empty?: boolean;
};

export type DashboardWeakTopic = {
  id: string;
  title: string;
  reason: string;
  href: string;
  tone: "warning" | "info";
};

function findModuleByTitle(modules: CourseProgressModuleRow[], moduleTitle: string): CourseProgressModuleRow | null {
  return modules.find((m) => m.module.title === moduleTitle) ?? null;
}

function firstUpcomingByKind(
  modules: CourseProgressModuleRow[],
  kind: DashboardUpcomingTask["kind"],
): DashboardUpcomingTask | null {
  return buildUpcomingTasks(modules).find((t) => t.kind === kind) ?? null;
}

/** Карточка ближайшей лекции (или повтор материала перед тестом). */
export function getNextLessonCard(modules: CourseProgressModuleRow[]): DashboardNextStepCard | null {
  if (modules.length === 0) return null;

  const upcoming = firstUpcomingByKind(modules, "lesson");
  if (upcoming) {
    return {
      kind: "lesson",
      title: "Лекция",
      moduleTitle: upcoming.moduleTitle,
      href: upcoming.href,
      statusLabel: "Следующий шаг",
    };
  }

  const focus = findFocusModule(modules);
  if (!focus) {
    return {
      kind: "lesson",
      title: "Нет открытых модулей",
      moduleTitle: "Завершите предыдущий модуль в цепочке",
      href: "/dashboard/course",
      statusLabel: "Карта курса",
      empty: true,
    };
  }

  const base = `/dashboard/course/${focus.module.id}`;
  const { requirements: req, progress: p } = focus;

  if (req.lessonRequired && !p?.lessonCompleted) {
    return {
      kind: "lesson",
      title: "Лекция модуля",
      moduleTitle: focus.module.title,
      href: `${base}/lesson`,
      statusLabel: "К началу модуля",
    };
  }

  if (req.testRequired && !p?.testCompleted && p?.lessonCompleted) {
    return {
      kind: "lesson",
      title: "Повторить материал",
      moduleTitle: focus.module.title,
      href: `${base}/lesson`,
      statusLabel: "Перед тестом",
    };
  }

  if (focus.moduleCompleted) {
    return {
      kind: "lesson",
      title: "Модуль завершён",
      moduleTitle: focus.module.title,
      href: base,
      statusLabel: "Открыть модуль",
    };
  }

  return {
    kind: "lesson",
    title: "Материалы модуля",
    moduleTitle: focus.module.title,
    href: `${base}/lesson`,
    statusLabel: "Лекция пройдена",
  };
}

/** Карточка ближайшей практики или теста, если практики ещё нет в очереди. */
export function getNextPracticeCard(modules: CourseProgressModuleRow[]): DashboardNextStepCard | null {
  if (modules.length === 0) return null;

  const practice = firstUpcomingByKind(modules, "practice");
  if (practice) {
    return {
      kind: "practice",
      title: "Практическая работа",
      moduleTitle: practice.moduleTitle,
      href: practice.href,
      statusLabel: "Следующий шаг",
    };
  }

  const test = firstUpcomingByKind(modules, "test");
  if (test) {
    return {
      kind: "test",
      title: "Контрольный тест",
      moduleTitle: test.moduleTitle,
      href: test.href,
      statusLabel: "После лекции",
    };
  }

  const focus = findFocusModule(modules);
  if (!focus) {
    return {
      kind: "practice",
      title: "Практика недоступна",
      moduleTitle: "Сначала откройте модуль в карте курса",
      href: "/dashboard/course",
      statusLabel: "Карта курса",
      empty: true,
    };
  }

  if (!focus.requirements.practiceRequired) {
    return {
      kind: "practice",
      title: "Без практики в модуле",
      moduleTitle: focus.module.title,
      href: `/dashboard/course/${focus.module.id}`,
      statusLabel: "Перейти к модулю",
      empty: true,
    };
  }

  if (focus.progress?.practiceCompleted) {
    return {
      kind: "practice",
      title: "Практика сдана",
      moduleTitle: focus.module.title,
      href: `/dashboard/course/${focus.module.id}/practice`,
      statusLabel: "Повторить лабораторию",
    };
  }

  return {
    kind: "practice",
    title: "Практика модуля",
    moduleTitle: focus.module.title,
    href: `/dashboard/course/${focus.module.id}/practice`,
    statusLabel: "После теста",
    empty: true,
  };
}

/** Рекомендации на основе реальных неуспехов и очереди шагов (без выдуманных тем). */
export function buildWeakTopicRecommendations(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
): DashboardWeakTopic[] {
  const items: DashboardWeakTopic[] = [];

  if (stats.lastTest && !stats.lastTest.passed) {
    const mod = findModuleByTitle(modules, stats.lastTest.moduleTitle);
    items.push({
      id: "weak-test",
      title: stats.lastTest.testTitle,
      reason: `Тест не зачтён — ${stats.lastTest.percent}% в модуле «${stats.lastTest.moduleTitle}»`,
      href: mod ? `/dashboard/course/${mod.module.id}/test` : "/dashboard/course",
      tone: "warning",
    });
  }

  if (stats.lastPractice) {
    const { status, statusLabel, taskTitle, moduleTitle } = stats.lastPractice;
    const mod = findModuleByTitle(modules, moduleTitle);
    if (status === "NEEDS_REVISION") {
      items.push({
        id: "weak-revision",
        title: taskTitle,
        reason: `Работа на доработке · ${moduleTitle}`,
        href: mod ? `/dashboard/course/${mod.module.id}/practice` : "/dashboard/my-assignments",
        tone: "warning",
      });
    } else if (status === "REJECTED") {
      items.push({
        id: "weak-rejected",
        title: taskTitle,
        reason: `Отправка отклонена · ${moduleTitle}`,
        href: mod ? `/dashboard/course/${mod.module.id}/practice` : "/dashboard/my-assignments",
        tone: "warning",
      });
    } else if (status === "SUBMITTED" || status === "CHECKING") {
      items.push({
        id: "weak-pending",
        title: taskTitle,
        reason: `${statusLabel} · ${moduleTitle}`,
        href: "/dashboard/my-assignments",
        tone: "info",
      });
    }
  }

  const nextTest = firstUpcomingByKind(modules, "test");
  if (nextTest && !items.some((i) => i.id === "weak-test")) {
    items.push({
      id: "upcoming-test",
      title: nextTest.moduleTitle,
      reason: "Рекомендуем повторить лекцию перед контрольным тестом",
      href: nextTest.href.replace(/\/test$/, "/lesson"),
      tone: "info",
    });
  }

  if (stats.scoreSuccessPercent > 0 && stats.scoreSuccessPercent < 55 && stats.maxPossiblePoints > 0) {
    items.push({
      id: "weak-score",
      title: "Набор баллов по курсу",
      reason: `Сейчас ${stats.scoreSuccessPercent}% от максимума — имеет смысл вернуться к тестам и практике`,
      href: stats.currentModuleId ? `/dashboard/course/${stats.currentModuleId}` : "/dashboard/course",
      tone: "info",
    });
  }

  return items.slice(0, 4);
}

export function getMentorHref(modules: CourseProgressModuleRow[], stats: ProfileCourseStats): string {
  const focus = findFocusModule(modules);
  if (focus) return `/dashboard/course/${focus.module.id}/lesson`;
  if (stats.currentModuleId) return `/dashboard/course/${stats.currentModuleId}/lesson`;
  return "/dashboard/course";
}

export function getQuickActionHrefs(modules: CourseProgressModuleRow[], stats: ProfileCourseStats) {
  const focus = findFocusModule(modules);
  const base = focus ? `/dashboard/course/${focus.module.id}` : stats.currentModuleId ? `/dashboard/course/${stats.currentModuleId}` : null;
  const testTask = firstUpcomingByKind(modules, "test");
  const practiceTask = firstUpcomingByKind(modules, "practice");

  return {
    modules: "/dashboard/course",
    practice: practiceTask?.href ?? (base ? `${base}/practice` : "/dashboard/course"),
    test: testTask?.href ?? (base ? `${base}/test` : "/dashboard/course"),
    mentor: getMentorHref(modules, stats),
  };
}

export function countPendingTasks(modules: CourseProgressModuleRow[]): number {
  return buildUpcomingTasks(modules).length;
}

export { getUiStatus };
