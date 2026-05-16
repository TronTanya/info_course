import { callOpenAiChatCompletions, type OpenAiChatMessage } from "@/lib/ai";
import { AiNotConfiguredError, AiProviderError, getOpenAiApiKey } from "@/lib/ai-config";
import { securityAudit } from "@/lib/security/audit";
import { buildLearnerMemory, formatMemoryBlock } from "@/lib/ai/tutor/context/memory";
import { buildDialogBlock, buildPageContextBlock } from "@/lib/ai/tutor/context/page-context";
import { temperatureForDifficulty } from "@/lib/ai/tutor/difficulty/adaptive";
import { fallbackTutorReply } from "@/lib/ai/tutor/fallbacks";
import { runPostLlmModeration, runPreLlmModeration } from "@/lib/ai/tutor/moderation/pipeline";
import { refusalFooterHint } from "@/lib/ai/tutor/moderation/refusals";
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

/**
 * Production pipeline AI-наставника: moderation → memory → prompt → LLM → moderation → recommendations.
 */
export async function runTutorPipeline(input: TutorPipelineInput): Promise<TutorPipelineResult> {
  const pre = runPreLlmModeration({
    userMessage: input.userMessage,
    history: input.history,
    pageContext: input.pageContext,
  });

  if (!pre.allow) {
    securityAudit({
      event: "ai.tutor.refused",
      severity: "warn",
      actorId: input.userId,
      meta: { code: pre.refusalCode, topic: pre.topic, notes: pre.notes },
    });
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
      meta: { topic },
    });
    throw new AiProviderError();
  }

  const post = runPostLlmModeration(raw);
  if (!post.ok) {
    securityAudit({
      event: "ai.tutor.output_blocked",
      severity: "warn",
      actorId: input.userId,
      meta: { reason: post.reason, topic },
    });
    return {
      reply: fallbackTutorReply({ reason: "output_blocked", topic }),
      meta: {
        topic,
        difficulty,
        recommendations,
        refused: false,
        refusalCode: "output_blocked",
        moderationNotes: [...pre.notes, post.reason],
      },
    };
  }

  let reply = post.text;
  const footer = refusalFooterHint(topic);
  if (footer) reply = `${reply}\n\n${footer}`;
  reply = appendRecommendationsBlock(reply, recommendations);

  securityAudit({
    event: "ai.tutor.success",
    severity: "info",
    actorId: input.userId,
    meta: { topic, difficulty },
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
