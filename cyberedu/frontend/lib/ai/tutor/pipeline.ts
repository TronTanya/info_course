import { callOpenAiChatCompletions, type OpenAiChatMessage } from "@/lib/ai";
import { AiNotConfiguredError, AiProviderError, getOpenAiApiKey } from "@/lib/ai-config";
import { securityAudit } from "@/lib/security/audit";
import { buildLearnerMemory, formatMemoryBlock } from "@/lib/ai/tutor/context/memory";
import { buildDialogBlock, buildPageContextBlock } from "@/lib/ai/tutor/context/page-context";
import { temperatureForDifficulty } from "@/lib/ai/tutor/difficulty/adaptive";
import { auditTutorModerationRefusal, auditTutorOutputBlocked } from "@/lib/ai/tutor/moderation/audit";
import { runPostLlmModeration, runPreLlmModeration } from "@/lib/ai/tutor/moderation/pipeline";
import { refusalFooterHint } from "@/lib/ai/tutor/moderation/refusals";
import { getRefusalTemplate, shouldPersistRefusalInHistory } from "@/lib/ai/tutor/moderation/refusal-templates";
import { buildTutorSystemPrompt } from "@/lib/ai/tutor/prompts/system";
import {
  appendRecommendationsBlock,
  buildLearningRecommendations,
} from "@/lib/ai/tutor/recommendations/learning";
import type { TutorPipelineInput, TutorPipelineResult } from "@/lib/ai/tutor/types";

function buildMessages(params: {
  system: string;
  pageBlock: string;
  memoryBlock: string;
  dialogBlock: string;
  userMessage: string;
}): OpenAiChatMessage[] {
  const userPayload = [
    params.pageBlock,
    "",
    params.memoryBlock,
    params.dialogBlock,
    params.dialogBlock ? "" : null,
    "### Новое сообщение ученика",
    params.userMessage,
  ]
    .filter((s) => s != null && String(s).length > 0)
    .join("\n");

  return [
    { role: "system", content: params.system },
    { role: "user", content: userPayload },
  ];
}

export type RunTutorPipelineOptions = TutorPipelineInput & {
  /** После ответа — сохранить пару реплик в server history. */
  persistHistory?: (userMessage: string, assistantReply: string) => Promise<void>;
};

/**
 * Production pipeline AI-наставника: moderation → memory → prompt → LLM → moderation → recommendations.
 */
export async function runTutorPipeline(input: RunTutorPipelineOptions): Promise<TutorPipelineResult> {
  const pre = runPreLlmModeration({
    userMessage: input.userMessage,
    history: input.history,
    pageContext: input.pageContext,
  });

  if (!pre.allow) {
    auditTutorModerationRefusal(input.userId, {
      stage: pre.refusalCode === "prompt_injection" ? "injection" : "topic",
      code: pre.refusalCode,
      topic: pre.topic,
      notes: pre.notes,
    });

    if (input.persistHistory && shouldPersistRefusalInHistory(pre.refusalCode)) {
      await input.persistHistory(input.userMessage, pre.refusalReply);
    }

    return {
      reply: pre.refusalReply,
      meta: {
        topic: pre.topic,
        difficulty: "intermediate",
        recommendations: [],
        refused: true,
        refusalCode: pre.refusalCode,
        moderationNotes: pre.notes,
      },
    };
  }

  if (!getOpenAiApiKey()) {
    throw new AiNotConfiguredError();
  }

  const memory = await buildLearnerMemory(input.userId, input.pageContext, pre.sanitizedHistory);
  const difficulty = memory.difficulty;
  const topic = pre.topic;

  const recommendations = buildLearningRecommendations(topic, memory, input.pageContext);

  const system = buildTutorSystemPrompt({
    difficulty,
    topic,
    practiceSocraticHints: input.practiceSocraticHints,
  });

  const messages = buildMessages({
    system,
    pageBlock: buildPageContextBlock(input.pageContext),
    memoryBlock: formatMemoryBlock(memory),
    dialogBlock: buildDialogBlock(pre.sanitizedHistory),
    userMessage: pre.sanitizedMessage,
  });

  const raw = await callOpenAiChatCompletions(messages, {
    temperature: temperatureForDifficulty(difficulty),
  });

  if (!raw) {
    securityAudit({
      event: "ai.tutor.provider_error",
      severity: "warn",
      actorId: input.userId,
      meta: { topic, stage: "llm" },
    });
    throw new AiProviderError();
  }

  const post = runPostLlmModeration(raw);
  if (!post.ok) {
    auditTutorOutputBlocked(input.userId, topic, post.category ?? "moderation");
    const safeReply = getRefusalTemplate("output_blocked");

    if (input.persistHistory) {
      await input.persistHistory(input.userMessage, safeReply);
    }

    return {
      reply: safeReply,
      meta: {
        topic,
        difficulty,
        recommendations,
        refused: false,
        refusalCode: "output_blocked",
        moderationNotes: [...pre.notes, post.category ?? post.reason],
      },
    };
  }

  let reply = post.text;
  const footer = refusalFooterHint(topic);
  if (footer) reply = `${reply}\n\n${footer}`;
  reply = appendRecommendationsBlock(reply, recommendations);

  if (input.persistHistory) {
    await input.persistHistory(pre.sanitizedMessage, reply);
  }

  securityAudit({
    event: "ai.tutor.success",
    severity: "info",
    actorId: input.userId,
    meta: { topic, difficulty, stage: "complete" },
  });

  return {
    reply,
    meta: {
      topic,
      difficulty,
      recommendations,
      refused: false,
      moderationNotes: pre.notes,
    },
  };
}
