import { moderateAiOutput, moderateUserPrompt } from "@/lib/security/ai-moderation";
import { classifyTutorTopic } from "@/lib/ai/tutor/classification/topics";
import { scanPromptInjection } from "@/lib/ai/tutor/moderation/injection";
import { prepareTrustedChatHistory } from "@/lib/ai/tutor/moderation/history";
import {
  evaluateRefusalPolicy,
  softRefusalAcademicIntegrity,
} from "@/lib/ai/tutor/moderation/refusals";
import { getRefusalTemplate } from "@/lib/ai/tutor/moderation/refusal-templates";
import type { TutorChatTurn, TutorPageContext, TutorTopic } from "@/lib/ai/tutor/types";

export type ModerationPipelineInput = {
  userMessage: string;
  /** Только server-side / prepareTrustedChatHistory. */
  history: TutorChatTurn[];
  pageContext: TutorPageContext;
};

export type ModerationPipelineResult =
  | {
      allow: true;
      sanitizedMessage: string;
      sanitizedHistory: TutorChatTurn[];
      topic: TutorTopic;
      notes: string[];
    }
  | {
      allow: false;
      topic: TutorTopic;
      refusalReply: string;
      refusalCode: import("@/lib/ai/tutor/types").TutorRefusalCode;
      notes: string[];
    };

function scanHistoryForInjection(history: TutorChatTurn[]): { safe: boolean; notes: string[] } {
  const notes: string[] = [];
  for (const turn of history) {
    if (turn.role !== "user") continue;
    const scan = scanPromptInjection(turn.content);
    if (!scan.safe) {
      notes.push(`history_injection:${scan.kind}`);
      return { safe: false, notes };
    }
  }
  return { safe: true, notes };
}

/**
 * Moderation pipeline (pre-LLM):
 * injection → input policy → trusted history → topic → refusals
 */
export function runPreLlmModeration(input: ModerationPipelineInput): ModerationPipelineResult {
  const notes: string[] = [];

  const injection = scanPromptInjection(input.userMessage);
  if (!injection.safe) {
    notes.push(`injection:${injection.kind}`);
    return {
      allow: false,
      topic: "prompt_injection",
      refusalReply: getRefusalTemplate("prompt_injection"),
      refusalCode: "prompt_injection",
      notes,
    };
  }

  const policy = moderateUserPrompt(injection.text);
  if (!policy.ok) {
    notes.push(`policy:${policy.category ?? "blocked"}`);
    return {
      allow: false,
      topic: "prompt_injection",
      refusalReply: getRefusalTemplate("policy_blocked"),
      refusalCode: "policy_blocked",
      notes,
    };
  }

  const sanitizedHistory = prepareTrustedChatHistory(input.history);
  const historyScan = scanHistoryForInjection(sanitizedHistory);
  notes.push(...historyScan.notes);
  if (!historyScan.safe) {
    return {
      allow: false,
      topic: "prompt_injection",
      refusalReply: getRefusalTemplate("prompt_injection"),
      refusalCode: "prompt_injection",
      notes,
    };
  }

  const topic = classifyTutorTopic(policy.text, input.pageContext);
  notes.push(`topic:${topic}`);

  const hardRefusal = evaluateRefusalPolicy(topic);
  if (hardRefusal) {
    notes.push(`refusal:${hardRefusal.code}`);
    return {
      allow: false,
      topic,
      refusalReply: hardRefusal.reply,
      refusalCode: hardRefusal.code,
      notes,
    };
  }

  if (topic === "academic_integrity") {
    const soft = softRefusalAcademicIntegrity();
    notes.push("refusal:exam_spoiler_soft");
    return {
      allow: false,
      topic,
      refusalReply: soft.reply,
      refusalCode: soft.code,
      notes,
    };
  }

  return {
    allow: true,
    sanitizedMessage: policy.text,
    sanitizedHistory,
    topic,
    notes,
  };
}

export function runPostLlmModeration(raw: string): { ok: true; text: string } | { ok: false; reason: string; category?: string } {
  const first = moderateAiOutput(raw, 8, 80_000);
  if (!first.ok) return first;

  const leak = scanPromptInjection(first.text, 80_000);
  if (!leak.safe) {
    return { ok: false, reason: "Ответ содержит подозрительные конструкции.", category: leak.kind };
  }

  return moderateAiOutput(leak.text, 8, 80_000);
}
