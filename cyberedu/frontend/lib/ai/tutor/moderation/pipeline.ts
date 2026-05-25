import { moderateAiOutput, moderateUserPrompt } from "@/lib/security/ai-moderation";
import { classifyTutorTopic } from "@/lib/ai/tutor/classification/topics";
import { scanPromptInjection } from "@/lib/ai/tutor/moderation/injection";
import { prepareTrustedChatHistory } from "@/lib/ai/tutor/moderation/history";
import {
  createAIMentorRefusal,
  detectAssessmentAnswerRequest,
} from "@/lib/ai/safety/mentor-policy";
import { evaluateRefusalPolicy } from "@/lib/ai/tutor/moderation/refusals";
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
      refusalKind?: import("@/lib/ai/safety/mentor-refusal-copy").MentorRefusalKind;
      notes: string[];
    };

function topicLabelFromPage(pageContext: TutorPageContext): string {
  const title = pageContext.moduleTitle?.trim();
  if (title && title !== "не привязано к модулю") return title;
  if (pageContext.lessonTitle?.trim()) return pageContext.lessonTitle.trim();
  if (pageContext.practicalTask?.title?.trim()) return pageContext.practicalTask.title.trim();
  return "кибербезопасность";
}

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
    const refusal = createAIMentorRefusal("prompt_injection");
    return {
      allow: false,
      topic: "prompt_injection",
      refusalReply: refusal.message,
      refusalCode: refusal.code,
      refusalKind: refusal.kind,
      notes,
    };
  }

  const policy = moderateUserPrompt(injection.text);
  if (!policy.ok) {
    notes.push(`policy:${policy.category ?? "blocked"}`);
    const refusal = createAIMentorRefusal("policy_blocked", {
      topicLabel: topicLabelFromPage(input.pageContext),
    });
    return {
      allow: false,
      topic: "prompt_injection",
      refusalReply: refusal.message,
      refusalCode: refusal.code,
      refusalKind: refusal.kind,
      notes,
    };
  }

  const sanitizedHistory = prepareTrustedChatHistory(input.history);
  const historyScan = scanHistoryForInjection(sanitizedHistory);
  notes.push(...historyScan.notes);
  if (!historyScan.safe) {
    const refusal = createAIMentorRefusal("prompt_injection");
    return {
      allow: false,
      topic: "prompt_injection",
      refusalReply: refusal.message,
      refusalCode: refusal.code,
      refusalKind: refusal.kind,
      notes,
    };
  }

  const topic = classifyTutorTopic(policy.text, input.pageContext);
  notes.push(`topic:${topic}`);

  const assessmentKind = detectAssessmentAnswerRequest(policy.text, {
    pageContext: input.pageContext,
  });
  if (assessmentKind) {
    const refusal = createAIMentorRefusal(assessmentKind, {
      topicLabel: topicLabelFromPage(input.pageContext),
    });
    notes.push(`safety:assessment_${assessmentKind}`);
    return {
      allow: false,
      topic: topic === "general" ? "academic_integrity" : topic,
      refusalReply: refusal.message,
      refusalCode: refusal.code,
      refusalKind: refusal.kind,
      notes,
    };
  }

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
    const refusal = createAIMentorRefusal("test_answer", {
      topicLabel: topicLabelFromPage(input.pageContext),
    });
    notes.push("refusal:exam_spoiler_soft");
    return {
      allow: false,
      topic,
      refusalReply: refusal.message,
      refusalCode: refusal.code,
      refusalKind: refusal.kind,
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
