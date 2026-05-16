import { SECURITY_ACTIONS } from "@/lib/security/audit-actions";
import { logSecurityEvent } from "@/lib/security/audit";
import type { TutorRefusalCode, TutorTopic } from "@/lib/ai/tutor/types";

/** Мета для аудита модерации — без текста сообщений и истории. */
export type TutorModerationAuditMeta = {
  stage: "input" | "injection" | "history" | "topic" | "output" | "client_history";
  code?: TutorRefusalCode;
  topic?: TutorTopic;
  notes?: string[];
  droppedAssistant?: number;
  historyIssues?: string[];
};

export function auditTutorModerationRefusal(
  actorId: string,
  meta: TutorModerationAuditMeta,
  ip?: string | null,
): void {
  logSecurityEvent({
    userId: actorId,
    action: SECURITY_ACTIONS.AI_SAFETY_REFUSAL,
    severity: meta.stage === "injection" || meta.code === "prompt_injection" ? "warn" : "info",
    ip,
    path: "/api/ai/chat",
    metadata: {
      stage: meta.stage,
      code: meta.code ?? null,
      topic: meta.topic ?? null,
      notes: meta.notes?.slice(0, 8) ?? [],
      droppedAssistant: meta.droppedAssistant ?? 0,
      historyIssues: meta.historyIssues?.slice(0, 6) ?? [],
    },
  });
}

export function auditTutorOutputBlocked(actorId: string, topic: TutorTopic, reasonCategory: string): void {
  logSecurityEvent({
    userId: actorId,
    action: SECURITY_ACTIONS.AI_SAFETY_OUTPUT_BLOCKED,
    severity: "warn",
    path: "/api/ai/chat",
    metadata: { stage: "output", topic, reasonCategory },
  });
}

export function auditUntrustedClientHistory(
  actorId: string,
  droppedAssistant: number,
  issues: string[],
): void {
  if (droppedAssistant === 0 && issues.length === 0) return;
  logSecurityEvent({
    userId: actorId,
    action: SECURITY_ACTIONS.AI_SAFETY_CLIENT_HISTORY,
    severity: "warn",
    path: "/api/ai/chat",
    metadata: {
      droppedAssistant,
      historyIssues: issues.slice(0, 6),
    },
  });
}
