import { buildCertificateRequirementRows, type CertificateRequirementRow } from "@/lib/certificate-eligibility";
import { computeStepMetrics, getContinueFromModules } from "@/lib/dashboard-ui";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";
import type { DashboardCertificateStatus } from "@/types/dashboard-view-model";

export const DASHBOARD_CERTIFICATE_STATUS_LABELS: Record<DashboardCertificateStatus, string> = {
  not_available: "Пока недоступен",
  in_progress: "В процессе",
  ready: "Готов к получению",
  issued: "Получен",
};

export const CERTIFICATE_PAGE_HREF = "/dashboard/certificate";
export const COURSE_MAP_HREF = "/dashboard/course";
export const CERTIFICATE_PROGRESS_CARD_TITLE = "Прогресс до сертификата";

/** Статус для UI — зеркало серверных флагов `ProfileCourseStats`, без пересчёта eligibility. */
export function resolveDashboardCertificateStatus(
  stats: ProfileCourseStats,
): DashboardCertificateStatus {
  if (stats.certificateIssued) return "issued";
  if (stats.allModulesComplete && stats.canGenerateCertificate) return "ready";
  if (stats.totalModules > 0) return "in_progress";
  return "not_available";
}

export type CertificateProgressCardCta = {
  label: string;
  href: string;
  external?: boolean;
};

export type CertificateProgressRequirement = {
  id: CertificateRequirementRow["id"];
  label: string;
  detail: string;
  met: boolean;
};

export type CertificateProgressCardModel = {
  status: DashboardCertificateStatus;
  title: string;
  headline: string;
  description: string;
  percentage: number;
  completedRequirements: CertificateProgressRequirement[];
  remainingRequirements: CertificateProgressRequirement[];
  primaryCta: CertificateProgressCardCta;
  secondaryCta?: CertificateProgressCardCta;
};

const REQUIREMENT_HEADLINES: Record<CertificateRequirementRow["id"], string> = {
  modules: "Завершить все модули программы",
  lessons: "Пройти все обязательные лекции",
  tests: "Сдать все обязательные тесты",
  practice: "Выполнить все обязательные практики",
};

function mapRequirementRows(rows: CertificateRequirementRow[]): CertificateProgressRequirement[] {
  return rows.map((row) => ({
    id: row.id,
    label: REQUIREMENT_HEADLINES[row.id],
    detail: row.detail,
    met: row.met,
  }));
}

function resolveHeadlineAndDescription(
  status: DashboardCertificateStatus,
  stats: ProfileCourseStats,
  remainingCount: number,
): { headline: string; description: string } {
  if (status === "not_available") {
    return {
      headline: "Сертификат пока недоступен",
      description:
        stats.totalModules === 0
          ? "В программе нет активных модулей — сертификат появится, когда курс будет настроен."
          : "Начните прохождение курса: после первых шагов здесь отобразится прогресс к выдаче.",
    };
  }

  if (status === "issued") {
    return {
      headline: "Сертификат получен",
      description: stats.certificateNumber
        ? `Документ № ${stats.certificateNumber} в реестре. Скачайте PDF или передайте ссылку на проверку.`
        : "Официальный документ доступен в разделе «Сертификат».",
    };
  }

  if (status === "ready") {
    return {
      headline: "Все условия выполнены",
      description: "Можно оформить сертификат с QR-кодом и публичной проверкой подлинности.",
    };
  }

  const modulesHint =
    stats.modulesUntilCertificate > 0
      ? `Осталось завершить ${stats.modulesUntilCertificate} мод.`
      : remainingCount > 0
        ? `Осталось ${remainingCount} условий.`
        : "Продолжайте программу по порядку модулей.";

  return {
    headline: "До сертификата осталось…",
    description: modulesHint,
  };
}

function resolveCtas(
  status: DashboardCertificateStatus,
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
): { primary: CertificateProgressCardCta; secondary?: CertificateProgressCardCta } {
  if (status === "issued") {
    const primary: CertificateProgressCardCta = {
      label: "Открыть сертификат",
      href: CERTIFICATE_PAGE_HREF,
    };
    const verifyUrl = stats.certificateVerifyUrl?.trim();
    const secondary =
      verifyUrl && verifyUrl.length > 0
        ? { label: "Проверить сертификат", href: verifyUrl, external: true }
        : undefined;
    return { primary, secondary };
  }

  if (status === "ready") {
    return {
      primary: { label: "Получить сертификат", href: CERTIFICATE_PAGE_HREF },
    };
  }

  if (status === "not_available") {
    return {
      primary: { label: "Открыть курс", href: COURSE_MAP_HREF },
      secondary: { label: "Условия сертификата", href: CERTIFICATE_PAGE_HREF },
    };
  }

  const continueTarget = getContinueFromModules(modules, stats.courseTitle);
  return {
    primary: {
      label: "Продолжить курс",
      href: continueTarget.href || COURSE_MAP_HREF,
    },
    secondary: { label: "Подробнее", href: CERTIFICATE_PAGE_HREF },
  };
}

/**
 * Модель карточки прогресса к сертификату.
 * Статус и eligibility — только из `ProfileCourseStats` (сервер); чеклист — отображение правил курса.
 */
export function buildCertificateProgressCardModel(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
): CertificateProgressCardModel {
  const metrics = computeStepMetrics(modules);
  const status = resolveDashboardCertificateStatus(stats);
  const rows = buildCertificateRequirementRows({
    completedModules: stats.completedModules,
    totalModules: stats.totalModules,
    courseCompleted: stats.allModulesComplete,
    metrics,
  });
  const requirements = mapRequirementRows(rows);
  const completedRequirements = requirements.filter((r) => r.met);
  const remainingRequirements = requirements.filter((r) => !r.met);
  const { headline, description } = resolveHeadlineAndDescription(
    status,
    stats,
    remainingRequirements.length,
  );
  const { primary, secondary } = resolveCtas(status, stats, modules);

  return {
    status,
    title: CERTIFICATE_PROGRESS_CARD_TITLE,
    headline,
    description,
    percentage: stats.progressPercent,
    completedRequirements,
    remainingRequirements,
    primaryCta: primary,
    secondaryCta: secondary,
  };
}
