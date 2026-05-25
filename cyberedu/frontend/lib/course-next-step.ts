import type { CertificateDashboardState } from "@/lib/certificate";
import {
  buildCoursePageCertificateSummary,
  type CoursePageCertificateSummary,
} from "@/lib/course-page-summary";
import { computeStepMetrics, findFocusModule } from "@/lib/dashboard-ui";
import type { ModuleRequirements } from "@/lib/progress";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { guestAuthLinks } from "@/lib/design-system/nav-config";

export type CourseNextStepKind = "lesson" | "test" | "practice" | "module" | "certificate" | "empty";

export type CourseNextStep = {
  kind: CourseNextStepKind;
  typeLabel: string;
  title: string;
  moduleTitle: string;
  description: string;
  estimatedTime: string;
  statusLabel: string;
  ctaLabel: string;
  href: string;
  empty?: boolean;
};

function stepTimeEstimate(kind: "lesson" | "test" | "practice", req: ModuleRequirements): string {
  let lo = 0;
  let hi = 0;
  if (kind === "lesson") {
    if (req.lessonRequired) {
      lo += 40;
      hi += 85;
    }
    if (req.videoRequired) {
      lo += 20;
      hi += 50;
    }
  } else if (kind === "test" && req.testRequired) {
    lo += 25;
    hi += 55;
  } else if (kind === "practice" && req.practiceRequired) {
    lo += 40;
    hi += 120;
  }
  if (lo === 0) return "—";
  const loM = Math.max(5, lo);
  const hiM = Math.max(loM, hi);
  return loM === hiM ? `~${loM} мин` : `~${loM}–${hiM} мин`;
}

function lessonPrepPending(row: CourseProgressModuleRow): boolean {
  const { requirements: req, progress: p } = row;
  return (
    (req.lessonRequired && !p?.lessonCompleted) || (req.videoRequired && !p?.videoCompleted)
  );
}

function testPending(row: CourseProgressModuleRow): boolean {
  return row.requirements.testRequired && !row.progress?.testCompleted;
}

function practicePending(row: CourseProgressModuleRow): boolean {
  return row.requirements.practiceRequired && !row.progress?.practiceCompleted;
}

function testLooksRetried(row: CourseProgressModuleRow): boolean {
  const p = row.progress;
  if (!p || p.testCompleted) return false;
  const lessonReady =
    (!row.requirements.lessonRequired || p.lessonCompleted) &&
    (!row.requirements.videoRequired || p.videoCompleted);
  return lessonReady && row.score > 0;
}

function buildLessonStep(row: CourseProgressModuleRow): CourseNextStep {
  const base = `/dashboard/course/${row.module.id}`;
  const p = row.progress;
  const started = Boolean(p?.lessonCompleted || p?.videoCompleted);
  const desc =
    row.module.description?.trim() ||
    "Изучите материал модуля — после лекции откроются тест и практика.";
  return {
    kind: "lesson",
    typeLabel: "Урок",
    title: row.module.title,
    moduleTitle: `Модуль ${row.module.orderNumber}`,
    description: desc,
    estimatedTime: stepTimeEstimate("lesson", row.requirements),
    statusLabel: started ? "В процессе" : "Следующий шаг",
    ctaLabel: started ? "Продолжить урок" : "Начать урок",
    href: `${base}/lesson`,
  };
}

function buildTestStep(row: CourseProgressModuleRow): CourseNextStep {
  const base = `/dashboard/course/${row.module.id}`;
  const retry = testLooksRetried(row);
  return {
    kind: "test",
    typeLabel: "Тест",
    title: "Контрольный тест",
    moduleTitle: row.module.title,
    description: retry
      ? "Предыдущая попытка не зачтена — пройдите тест снова для открытия практики."
      : "Проверьте знания по модулю. Для зачёта нужен проходной балл.",
    estimatedTime: stepTimeEstimate("test", row.requirements),
    statusLabel: retry ? "Нужен повтор" : "Готов к прохождению",
    ctaLabel: retry ? "Повторить тест" : "Пройти тест",
    href: `${base}/test`,
  };
}

function buildPracticeStep(row: CourseProgressModuleRow): CourseNextStep {
  const base = `/dashboard/course/${row.module.id}`;
  const p = row.progress;
  const started = Boolean(p?.testCompleted && !p?.practiceCompleted);
  return {
    kind: "practice",
    typeLabel: "Практика",
    title: "Практическое задание",
    moduleTitle: row.module.title,
    description: "Примените навыки модуля в лаборатории. Отправьте решение на проверку.",
    estimatedTime: stepTimeEstimate("practice", row.requirements),
    statusLabel: started ? "В работе" : "Доступна",
    ctaLabel: "Открыть практику",
    href: `${base}/practice`,
  };
}

function buildModuleStep(row: CourseProgressModuleRow): CourseNextStep {
  const base = `/dashboard/course/${row.module.id}`;
  return {
    kind: "module",
    typeLabel: "Модуль",
    title: row.module.title,
    moduleTitle: `Модуль ${row.module.orderNumber}`,
    description: row.module.description?.trim() || "Завершите оставшиеся шаги модуля.",
    estimatedTime: "—",
    statusLabel: "Почти завершён",
    ctaLabel: "Открыть модуль",
    href: base,
  };
}

function buildCertificateStep(cert: CoursePageCertificateSummary): CourseNextStep {
  const ready = cert.ready && !cert.issued;
  return {
    kind: "certificate",
    typeLabel: "Сертификат",
    title: cert.issued ? "Сертификат выдан" : ready ? "Получить сертификат" : "Сертификат курса",
    moduleTitle: "Программа завершена",
    description: cert.detail,
    estimatedTime: "≈ 5 мин",
    statusLabel: cert.statusLabel,
    ctaLabel: cert.issued ? "Открыть сертификат" : ready ? "Получить сертификат" : cert.cta.label,
    href: cert.cta.href,
  };
}

function buildEmptyStep(modules: CourseProgressModuleRow[]): CourseNextStep {
  const first = modules.find((m) => m.unlocked) ?? modules[0];
  const href = first?.unlocked
    ? `/dashboard/course/${first.module.id}/lesson`
    : "/dashboard/course";

  return {
    kind: "empty",
    typeLabel: "Старт",
    title: "Начните курс с первого модуля",
    moduleTitle: first ? `Модуль ${first.module.orderNumber}` : "Карта курса",
    description: first
      ? `Откройте «${first.module.title}» и пройдите первую лекцию.`
      : "Модули курса появятся здесь после настройки программы.",
    estimatedTime: first ? stepTimeEstimate("lesson", first.requirements) : "—",
    statusLabel: "Новый трек",
    ctaLabel: "Начать обучение",
    href,
    empty: true,
  };
}

/** Следующий логичный шаг студента (только разблокированные сущности). */
export function resolveCourseNextStep(
  modules: CourseProgressModuleRow[],
  certificate: Pick<CertificateDashboardState, "certificate" | "canGenerate"> | null,
): CourseNextStep {
  const metrics = computeStepMetrics(modules);
  const cert = buildCoursePageCertificateSummary(modules, metrics, certificate);

  const allModulesComplete = modules.length > 0 && modules.every((m) => m.moduleCompleted);
  if (allModulesComplete) {
    return buildCertificateStep(cert);
  }

  for (const row of modules) {
    if (!row.unlocked || row.moduleCompleted) continue;

    if (lessonPrepPending(row)) {
      return buildLessonStep(row);
    }
    if (testPending(row)) {
      return buildTestStep(row);
    }
    if (practicePending(row)) {
      return buildPracticeStep(row);
    }
    return buildModuleStep(row);
  }

  const focus = findFocusModule(modules);
  if (focus) {
    if (lessonPrepPending(focus)) return buildLessonStep(focus);
    if (testPending(focus)) return buildTestStep(focus);
    if (practicePending(focus)) return buildPracticeStep(focus);
    return buildModuleStep(focus);
  }

  if (modules.length === 0) {
    return buildEmptyStep(modules);
  }

  return buildEmptyStep(modules);
}

/** CTA для гостя (лендинг / превью без сессии). */
export function guestCourseNextStepCta(): Pick<CourseNextStep, "href" | "ctaLabel"> {
  return {
    href: guestAuthLinks.register,
    ctaLabel: guestAuthLinks.registerLabel,
  };
}
