/** Префиксы действий, требующих внимания администратора (без раскрытия meta/PII). */
export const ADMIN_SENSITIVE_ACTION_PREFIXES = [
  "auth.login",
  "admin.",
  "certificate.",
  "ai.safety",
] as const;

const SEVERITY_ATTENTION = new Set(["warn", "warning", "high", "danger"]);

export function isSensitiveAuditAction(action: string): boolean {
  return ADMIN_SENSITIVE_ACTION_PREFIXES.some((p) => action.startsWith(p));
}

export function isSuspiciousAuditEvent(action: string, severity: string): boolean {
  return isSensitiveAuditAction(action) || SEVERITY_ATTENTION.has(severity);
}

const ACTION_LABELS_RU: Record<string, string> = {
  "auth.login.success": "Успешный вход",
  "auth.login.failed": "Неудачный вход",
  "auth.login.locked": "Аккаунт заблокирован",
  "auth.login.rate_limited": "Лимит попыток входа",
  "admin.user.role_change": "Смена роли пользователя",
  "admin.csv_export": "Экспорт CSV (админ)",
  "admin.users.csv_export": "Экспорт пользователей (CSV)",
  "admin.practice.review": "Проверка практики",
  "admin.content.publish": "Публикация контента",
  "admin.content.unpublish": "Снятие с публикации",
  "certificate.generate": "Выдача сертификата",
  "certificate.verify.abuse": "Подозрительная проверка сертификата",
  "certificate.verify.failed": "Неудачная проверка сертификата",
  "ai.safety.refusal": "AI: отказ по политике",
  "ai.safety.output_blocked": "AI: заблокированный ответ",
  "ai.safety.client_history_rejected": "AI: отклонена история клиента",
};

export function auditActionLabelRu(action: string): string {
  return ACTION_LABELS_RU[action] ?? action;
}

/** Без UUID и email — только роль оператора для audit-строки. */
export function auditActorLabel(hasActor: boolean): string {
  return hasActor ? "оператор с правами" : "система";
}
