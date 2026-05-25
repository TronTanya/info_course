import type { DashboardStepMetrics } from "@/lib/dashboard-ui";
import { computeStepMetrics, getContinueFromModules } from "@/lib/dashboard-ui";
import type { CertificateDashboardState } from "@/lib/certificate";
import type { CourseProgressModuleRow, UserCourseProgressResult } from "@/lib/progress";

export const COURSE_PAGE_BADGE = "Курс по информационной безопасности";

export const COURSE_PAGE_SUBTITLE_FALLBACK =
  "Программа из модулей по цепочке: лекции, тесты и практические задания. Прогресс и сертификат — в одном треке.";

export type CoursePageContinueCta = {
  href: string;
  label: string;
  hint: string;
};

export type CoursePageCertificateCta = {
  href: string;
  label: string;
};

export type CoursePageCertificateSummary = {
  issued: boolean;
  ready: boolean;
  remainingConditions: number;
  totalConditions: number;
  statusLabel: string;
  detail: string;
  cta: CoursePageCertificateCta;
};

export type CoursePageSummary = {
  badge: string;
  title: string;
  subtitle: string;
  progressPercent: number;
  modulesCompleted: number;
  modulesTotal: number;
  steps: DashboardStepMetrics;
  continue: CoursePageContinueCta;
  certificate: CoursePageCertificateSummary;
};

const CERTIFICATE_REQUIREMENT_COUNT = 4;

export type CourseCertificateRequirement = {
  label: string;
  met: boolean;
};

export function buildCourseCertificateRequirements(
  modules: CourseProgressModuleRow[],
  metrics: DashboardStepMetrics,
): CourseCertificateRequirement[] {
  const modulesTotal = modules.length;
  const modulesDone = modules.filter((m) => m.moduleCompleted).length;
  return [
    {
      label: `Модули: ${modulesDone} / ${modulesTotal || "—"}`,
      met: modulesTotal > 0 && modulesDone >= modulesTotal,
    },
    {
      label:
        metrics.lessonsTotal > 0
          ? `Лекции: ${metrics.lessonsDone} / ${metrics.lessonsTotal}`
          : "Лекции: не требуются",
      met: metrics.lessonsTotal === 0 || metrics.lessonsDone >= metrics.lessonsTotal,
    },
    {
      label:
        metrics.testsTotal > 0 ? `Тесты: ${metrics.testsDone} / ${metrics.testsTotal}` : "Тесты: не требуются",
      met: metrics.testsTotal === 0 || metrics.testsDone >= metrics.testsTotal,
    },
    {
      label:
        metrics.practiceTotal > 0
          ? `Практика: ${metrics.practiceDone} / ${metrics.practiceTotal}`
          : "Практика: не требуется",
      met: metrics.practiceTotal === 0 || metrics.practiceDone >= metrics.practiceTotal,
    },
  ];
}

function certificateRequirements(
  modules: CourseProgressModuleRow[],
  metrics: DashboardStepMetrics,
): { met: boolean }[] {
  return buildCourseCertificateRequirements(modules, metrics).map((r) => ({ met: r.met }));
}

export function buildCoursePageCertificateSummary(
  modules: CourseProgressModuleRow[],
  metrics: DashboardStepMetrics,
  cert: Pick<CertificateDashboardState, "certificate" | "canGenerate"> | null,
): CoursePageCertificateSummary {
  const reqs = certificateRequirements(modules, metrics);
  const remainingConditions = reqs.filter((r) => !r.met).length;
  const issued = Boolean(cert?.certificate);
  const ready = issued || Boolean(cert?.canGenerate) || remainingConditions === 0;

  if (issued) {
    const number = cert?.certificate?.certificateNumber;
    return {
      issued: true,
      ready: true,
      remainingConditions: 0,
      totalConditions: CERTIFICATE_REQUIREMENT_COUNT,
      statusLabel: "Выдан",
      detail: number ? `Документ № ${number}` : "Сертификат в личном кабинете",
      cta: { href: "/dashboard/certificate", label: "К сертификату" },
    };
  }

  if (ready) {
    return {
      issued: false,
      ready: true,
      remainingConditions: 0,
      totalConditions: CERTIFICATE_REQUIREMENT_COUNT,
      statusLabel: "Готов к выдаче",
      detail: "Все условия выполнены — оформите документ с проверкой.",
      cta: { href: "/dashboard/certificate", label: "К сертификату" },
    };
  }

  const leftWord =
    remainingConditions === 1
      ? "условие"
      : remainingConditions >= 2 && remainingConditions <= 4
        ? "условия"
        : "условий";

  return {
    issued: false,
    ready: false,
    remainingConditions,
    totalConditions: CERTIFICATE_REQUIREMENT_COUNT,
    statusLabel: "Не готов",
    detail:
      remainingConditions > 0
        ? `Осталось ${remainingConditions} ${leftWord} из ${CERTIFICATE_REQUIREMENT_COUNT}`
        : "Завершите программу, чтобы открыть выдачу",
    cta: { href: "/dashboard/certificate", label: "Посмотреть условия сертификата" },
  };
}

export function buildCoursePageSummary(
  data: UserCourseProgressResult,
  cert: Pick<CertificateDashboardState, "certificate" | "canGenerate"> | null,
): CoursePageSummary {
  const modules = data.modules;
  const steps = computeStepMetrics(modules);
  const modulesCompleted = modules.filter((m) => m.moduleCompleted).length;
  const modulesTotal = modules.length;
  const continueCta = getContinueFromModules(modules, data.course.title);

  return {
    badge: COURSE_PAGE_BADGE,
    title: data.course.title,
    subtitle: data.course.description?.trim() || COURSE_PAGE_SUBTITLE_FALLBACK,
    progressPercent: data.overallProgressPercent,
    modulesCompleted,
    modulesTotal,
    steps,
    continue: {
      href: continueCta.href,
      label: continueCta.label,
      hint: continueCta.hint,
    },
    certificate: buildCoursePageCertificateSummary(modules, steps, cert),
  };
}
