import type { AdminControlCenterKpis, AdminKpiTrendSnapshot } from "@/lib/admin-control-center";

export type AdminKpiCardTone = "default" | "primary" | "success" | "warning" | "danger";

export type AdminKpiCardView = {
  id: string;
  label: string;
  value: string;
  description: string;
  tone: AdminKpiCardTone;
  trend?: AdminKpiTrendSnapshot;
  /** Показывается под значением при value «—». */
  emptyHint?: string;
  titleAttr?: string;
};

export type AdminKpiCardsInput = {
  totalStudents: number;
  activeStudents7d: number;
  averageProgressPercentage: number | null;
  pendingPracticeReviews: number;
  issuedCertificates: number;
  auditLogAvailable: boolean;
  failedLogins24h: number;
  securityEvents24h: number;
  failedLogins7d?: number;
  securityEvents7d?: number;
  trends?: AdminControlCenterKpis["trends"];
};

const NO_DATA = "Нет данных";

function formatSecurityValue(
  input: Pick<
    AdminKpiCardsInput,
    "auditLogAvailable" | "failedLogins24h" | "securityEvents24h" | "failedLogins7d" | "securityEvents7d"
  >,
): Pick<AdminKpiCardView, "value" | "description" | "tone" | "emptyHint" | "titleAttr"> {
  if (!input.auditLogAvailable) {
    return {
      value: "—",
      description: "Журнал аудита отключён",
      tone: "default",
      emptyHint: NO_DATA,
      titleAttr: NO_DATA,
    };
  }

  const weekHint =
    input.failedLogins7d != null || input.securityEvents7d != null
      ? ` · за 7 дн.: ${input.failedLogins7d ?? 0} неудачных входов, ${input.securityEvents7d ?? 0} событий`
      : "";

  if (input.failedLogins24h > 0) {
    const extra =
      input.securityEvents24h > 0
        ? ` · ${input.securityEvents24h} прочих событий за 24 ч`
        : "";
    return {
      value: String(input.failedLogins24h),
      description: `Неудачные входы за 24 ч${extra}${weekHint}`,
      tone: "danger",
      titleAttr: `Неудачные входы: ${input.failedLogins24h}`,
    };
  }

  if (input.securityEvents24h > 0) {
    return {
      value: String(input.securityEvents24h),
      description: `События безопасности за 24 ч${weekHint}`,
      tone: "warning",
      titleAttr: `События безопасности: ${input.securityEvents24h}`,
    };
  }

  return {
    value: "0",
    description: `Нет срабатываний за 24 ч${weekHint}`,
    tone: "success",
    titleAttr: "Событий безопасности за последние 24 часа нет",
  };
}

/** View-model для AdminKpiCards (без выдуманных трендов). */
export function buildAdminKpiCardsView(input: AdminKpiCardsInput): AdminKpiCardView[] {
  const security = formatSecurityValue(input);

  const progress =
    input.averageProgressPercentage == null
      ? {
          value: "—" as const,
          description: "Нет зарегистрированных студентов",
          tone: "default" as const,
          emptyHint: NO_DATA,
          titleAttr: NO_DATA,
        }
      : {
          value: `${input.averageProgressPercentage}%`,
          description: "Средний % завершения активных модулей",
          tone: "primary" as const,
          titleAttr: `Средний прогресс: ${input.averageProgressPercentage}%`,
        };

  return [
    {
      id: "students",
      label: "Студенты",
      value: String(input.totalStudents),
      description: "Зарегистрировано (роль USER)",
      tone: "default",
      titleAttr: `Всего студентов: ${input.totalStudents}`,
    },
    {
      id: "active-7d",
      label: "Активны за 7 дней",
      value: String(input.activeStudents7d),
      description: "Прогресс, тесты или практика",
      tone: "primary",
      trend: input.trends?.activeStudents7d,
      titleAttr: `Активны за 7 дней: ${input.activeStudents7d}`,
    },
    {
      id: "avg-progress",
      label: "Средний прогресс",
      value: progress.value,
      description: progress.description,
      tone: progress.tone,
      emptyHint: progress.emptyHint,
      titleAttr: progress.titleAttr,
    },
    {
      id: "pending-practice",
      label: "Практики на проверке",
      value: String(input.pendingPracticeReviews ?? 0),
      description: "Отправлено, на проверке, доработка",
      tone: (input.pendingPracticeReviews ?? 0) > 0 ? "warning" : "default",
      titleAttr: `В очереди: ${input.pendingPracticeReviews ?? 0}`,
    },
    {
      id: "certificates",
      label: "Сертификаты",
      value: String(input.issuedCertificates ?? 0),
      description: "Выдано в реестре",
      tone: "success",
      trend: input.trends?.certificatesIssued7d,
      titleAttr: `Сертификатов выдано: ${input.issuedCertificates ?? 0}`,
    },
    {
      id: "security",
      label: "Безопасность",
      value: security.value,
      description: security.description,
      tone: security.tone,
      trend: input.auditLogAvailable ? input.trends?.security24h : undefined,
      emptyHint: security.emptyHint,
      titleAttr: security.titleAttr,
    },
  ];
}

export function adminKpiCardsFromControlCenter(kpis: AdminControlCenterKpis): AdminKpiCardsInput {
  return {
    totalStudents: kpis.totalStudents,
    activeStudents7d: kpis.activeStudents7d,
    averageProgressPercentage: kpis.averageProgressPercent,
    pendingPracticeReviews: kpis.pendingSubmissions,
    issuedCertificates: kpis.certificatesIssued,
    auditLogAvailable: kpis.auditLogAvailable,
    failedLogins24h: kpis.failedLogins24h,
    securityEvents24h: kpis.securityEvents24h,
    failedLogins7d: kpis.failedLogins7d,
    securityEvents7d: kpis.securityEvents7d,
    trends: kpis.trends,
  };
}

/** Отличает view-model карточек от KPI control center (у обоих есть auditLogAvailable). */
export function isAdminKpiCardsInput(
  data: AdminKpiCardsInput | AdminControlCenterKpis,
): data is AdminKpiCardsInput {
  return "pendingPracticeReviews" in data;
}

export function resolveAdminKpiCardsInput(
  data: AdminKpiCardsInput | AdminControlCenterKpis,
): AdminKpiCardsInput {
  return isAdminKpiCardsInput(data) ? data : adminKpiCardsFromControlCenter(data);
}
