import { Badge } from "@/components/ui/badge";
import { auditSeverityPresentation } from "@/lib/admin-a11y";

/** Severity с явным текстом — цвет не единственный носитель смысла. */
export function AdminAuditSeverityBadge({ severity }: { severity: string }) {
  const p = auditSeverityPresentation(severity);
  return (
    <Badge variant={p.variant} title={`Уровень: ${p.label}`}>
      <span>{p.label}</span>
      <span className="sr-only"> ({p.code})</span>
    </Badge>
  );
}
