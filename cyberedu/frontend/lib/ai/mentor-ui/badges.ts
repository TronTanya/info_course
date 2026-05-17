import type { TutorDifficulty, TutorPipelineMeta, TutorRefusalCode, TutorTopic } from "@/lib/ai/tutor/types";
import { topicLabelRu } from "@/lib/ai/tutor/classification/topics";

export type SecurityLevel = "awareness" | "analyst" | "specialist";

export function difficultyToSecurityLevel(d: TutorDifficulty): SecurityLevel {
  if (d === "advanced") return "specialist";
  if (d === "intermediate") return "analyst";
  return "awareness";
}

export function securityLevelLabel(level: SecurityLevel): string {
  const map: Record<SecurityLevel, string> = {
    awareness: "Awareness",
    analyst: "Analyst",
    specialist: "Specialist",
  };
  return map[level];
}

export function topicToThreatCategory(topic: TutorTopic): string {
  return topicLabelRu(topic);
}

export type SafeResponseState = "safe" | "refusal" | "policy";

export function resolveSafeResponseState(meta?: TutorPipelineMeta): SafeResponseState {
  if (!meta) return "safe";
  if (meta.refused) return "refusal";
  if (
    meta.refusalCode === "policy_blocked" ||
    meta.refusalCode === "prompt_injection" ||
    meta.refusalCode === "output_blocked"
  ) {
    return "policy";
  }
  if (meta.topic === "offensive_request" || meta.topic === "prompt_injection") {
    return "policy";
  }
  return "safe";
}

export function safeResponseLabel(state: SafeResponseState): string {
  switch (state) {
    case "safe":
      return "Безопасный учебный ответ";
    case "refusal":
      return "Защитный отказ";
    case "policy":
      return "Политика безопасности";
  }
}

export function refusalCodeHint(code?: TutorRefusalCode): string | null {
  if (!code) return null;
  const map: Partial<Record<TutorRefusalCode, string>> = {
    policy_blocked: "Запрос вне учебной политики",
    offensive_attack: "Атакующий сценарий не раскрывается",
    exam_spoiler: "Без готовых ответов на проверку знаний",
    prompt_injection: "Попытка смены роли отклонена",
    output_blocked: "Ответ отфильтрован модерацией",
  };
  return map[code] ?? null;
}
