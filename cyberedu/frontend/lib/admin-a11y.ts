/** Тексты и маппинги a11y для админ-панели (без утечки технических деталей). */

export type AuditSeverityPresentation = {
  /** Человекочитаемый уровень (не только цвет). */
  label: string;
  /** Краткий код для бейджа, дублирует severity. */
  code: string;
  variant: "success" | "warning" | "danger" | "secondary";
};

const SEVERITY_MAP: Record<string, Omit<AuditSeverityPresentation, "code">> = {
  danger: { label: "Критично", variant: "danger" },
  high: { label: "Высокий", variant: "warning" },
  warn: { label: "Предупреждение", variant: "warning" },
  warning: { label: "Предупреждение", variant: "warning" },
  info: { label: "Информация", variant: "secondary" },
  low: { label: "Низкий", variant: "secondary" },
  ok: { label: "Норма", variant: "success" },
  success: { label: "Норма", variant: "success" },
};

/** Severity аудита: цвет + явный текст (WCAG 1.4.1). */
export function auditSeverityPresentation(severity: string): AuditSeverityPresentation {
  const key = severity.trim().toLowerCase();
  const mapped = SEVERITY_MAP[key];
  if (mapped) {
    return { ...mapped, code: severity };
  }
  return { label: severity || "Неизвестно", code: severity || "—", variant: "secondary" };
}

/** Подпись уровня completion по проценту (дополнение к числу). */
export function completionLevelLabel(percent: number): string {
  if (percent < 40) return "низкий";
  if (percent < 70) return "средний";
  return "достаточный";
}
