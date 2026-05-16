import { moderateAiOutput, moderateUserPrompt, sanitizeChatHistory } from "@/lib/security/ai-moderation";
import { classifyTutorTopic } from "@/lib/ai/tutor/classification/topics";
import { scanPromptInjection } from "@/lib/ai/tutor/moderation/injection";
import {
  evaluateRefusalPolicy,
  softRefusalAcademicIntegrity,
} from "@/lib/ai/tutor/moderation/refusals";
import type { TutorChatTurn, TutorPageContext, TutorTopic } from "@/lib/ai/tutor/types";

export type ModerationPipelineInput = {
  userMessage: string;
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

/**
 * Moderation pipeline (pre-LLM):
 * 1. sanitize + policy
 * 2. injection scan
 * 3. topic classification
 * 4. refusal policies
 */
export function runPreLlmModeration(input: ModerationPipelineInput): ModerationPipelineResult {
  const notes: string[] = [];

  const injection = scanPromptInjection(input.userMessage);
  if (!injection.safe) {
    notes.push(`injection:${injection.kind}`);
    return {
      allow: false,
      topic: "prompt_injection",
      refusalReply: evaluateRefusalPolicy("prompt_injection")!.reply,
      refusalCode: "prompt_injection",
      notes,
    };
  }

  const policy = moderateUserPrompt(injection.text);
  if (!policy.ok) {
    notes.push("policy:blocked");
    return {
      allow: false,
      topic: "prompt_injection",
      refusalReply:
        "Этот запрос я не могу обсуждать в учебном чате. Сформулируйте вопрос по материалам курса или по защите информации в легальном контексте.",
      refusalCode: "policy_blocked",
      notes,
    };
  }

  const sanitizedHistory = sanitizeChatHistory(input.history) as TutorChatTurn[];
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

export function runPostLlmModeration(raw: string): { ok: true; text: string } | { ok: false; reason: string } {
  return moderateAiOutput(raw, 8, 80_000);
}
