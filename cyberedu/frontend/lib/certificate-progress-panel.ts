import type { CertificateDashboardState } from "@/lib/certificate";
import {
  buildCertificateRemainingItems,
  buildCertificateRequirements,
  type CertificateRequirementRow,
} from "@/lib/certificate-ui";

export type CertificateProgressStatus = "unavailable" | "almost_ready" | "ready" | "issued";

export type CertificateProgressStatusLabel =
  | "Пока недоступен"
  | "Почти готов"
  | "Готов к получению"
  | "Получен";

export type CertificateProgressPanelCta = {
  label: string;
  href: string;
  variant: "primary" | "outline";
};

export type CertificateProgressPanelView = {
  status: CertificateProgressStatus;
  statusLabel: CertificateProgressStatusLabel;
  summary: string;
  percentToCertificate: number;
  requirements: CertificateRequirementRow[];
  completedRequirements: CertificateRequirementRow[];
  remainingRequirements: CertificateRequirementRow[];
  remainingHints: string[];
  primaryCta: CertificateProgressPanelCta;
  secondaryCta: CertificateProgressPanelCta | null;
};

const STATUS_LABELS: Record<CertificateProgressStatus, CertificateProgressStatusLabel> = {
  unavailable: "Пока недоступен",
  almost_ready: "Почти готов",
  ready: "Готов к получению",
  issued: "Получен",
};

function resolveDisplayStatus(state: CertificateDashboardState): CertificateProgressStatus {
  if (state.certificate) return "issued";
  if (state.canGenerate) return "ready";
  if (state.progressPercent >= 75 && !state.courseCompleted) return "almost_ready";
  const modulesLeft = state.totalModules - state.completedModules;
  if (modulesLeft > 0 && modulesLeft <= 2 && state.progressPercent >= 50) return "almost_ready";
  return "unavailable";
}

function buildSummary(
  status: CertificateProgressStatus,
  state: CertificateDashboardState,
  remainingCount: number,
): string {
  if (status === "issued") {
    const num = state.certificate?.certificateNumber;
    return num
      ? `Сертификат № ${num} в реестре CyberEdu. Скачайте PDF или передайте ссылку на проверку.`
      : "Сертификат выдан — откройте раздел для скачивания и публичной проверки.";
  }
  if (status === "ready") {
    return "Все обязательные условия выполнены. Оформите официальный документ с QR и проверкой подлинности.";
  }
  if (status === "almost_ready") {
    return remainingCount > 0
      ? `Осталось ${remainingCount} условий до выдачи. Продолжайте курс по порядку модулей.`
      : "Почти все требования закрыты — проверьте оставшиеся шаги в программе.";
  }
  return "Завершите все модули программы — лекции, тесты и практики входят в завершение модуля.";
}

function buildCtas(
  status: CertificateProgressStatus,
  state: CertificateDashboardState,
): { primary: CertificateProgressPanelCta; secondary: CertificateProgressPanelCta | null } {
  const courseHref = "/dashboard/course";
  const certHref = "/dashboard/certificate";

  if (status === "issued" && state.certificate) {
    const verifyHref = state.certificate.verifyUrl?.trim() || certHref;
    const pdfHref =
      state.certificate.pdfReady && !state.certificate.revokedAt
        ? `/api/certificates/download/${state.certificate.id}`
        : certHref;
    return {
      primary: {
        label: state.certificate.pdfReady ? "Скачать PDF" : "Открыть сертификат",
        href: pdfHref,
        variant: "primary",
      },
      secondary: { label: "Проверить подлинность", href: verifyHref, variant: "outline" },
    };
  }

  if (status === "ready") {
    return {
      primary: { label: "Получить сертификат", href: certHref, variant: "primary" },
      secondary: { label: "Продолжить курс", href: courseHref, variant: "outline" },
    };
  }

  return {
    primary: { label: "Продолжить курс", href: courseHref, variant: "primary" },
    secondary: { label: "Условия сертификата", href: certHref, variant: "outline" },
  };
}

/**
 * Представление панели прогресса к сертификату (только отображение; правила — certificate-ui + server canGenerate).
 */
export function buildCertificateProgressPanelView(
  state: CertificateDashboardState,
): CertificateProgressPanelView {
  const requirements = buildCertificateRequirements(state, state.stepMetrics);
  const completedRequirements = requirements.filter((r) => r.met);
  const remainingRequirements = requirements.filter((r) => !r.met);
  const percentToCertificate = state.certificate
    ? 100
    : state.progressPercent;

  const status = resolveDisplayStatus(state);
  const remainingHints = buildCertificateRemainingItems(state, requirements);

  return {
    status,
    statusLabel: STATUS_LABELS[status],
    summary: buildSummary(status, state, remainingRequirements.length),
    percentToCertificate,
    requirements,
    completedRequirements,
    remainingRequirements,
    remainingHints,
    ...(() => {
      const ctas = buildCtas(status, state);
      return { primaryCta: ctas.primary, secondaryCta: ctas.secondary };
    })(),
  };
}
