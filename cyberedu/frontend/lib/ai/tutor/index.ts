/**
 * CyberEdu AI Tutor — production educational cybersecurity assistant.
 *
 * @architecture
 * ```
 * POST /api/ai/chat
 *   └─ runTutorPipeline (pipeline.ts)
 *        ├─ runPreLlmModeration (moderation/pipeline.ts)
 *        │     ├─ scanPromptInjection
 *        │     ├─ moderateUserPrompt (security)
 *        │     ├─ classifyTutorTopic
 *        │     └─ evaluateRefusalPolicy
 *        ├─ buildLearnerMemory (context/memory.ts)
 *        ├─ buildTutorSystemPrompt (prompts/system.ts)
 *        ├─ callOpenAiChatCompletions
 *        ├─ runPostLlmModeration
 *        └─ buildLearningRecommendations
 * ```
 */

export { runTutorPipeline } from "@/lib/ai/tutor/pipeline";
export { EXAMPLE_SYSTEM_PROMPT, buildTutorSystemPrompt } from "@/lib/ai/tutor/prompts/system";
export { runPreLlmModeration, runPostLlmModeration } from "@/lib/ai/tutor/moderation/pipeline";
export { classifyTutorTopic, topicLabelRu } from "@/lib/ai/tutor/classification/topics";
export type {
  TutorPipelineInput,
  TutorPipelineResult,
  TutorPipelineMeta,
  TutorPageContext,
  TutorChatTurn,
  TutorTopic,
  TutorDifficulty,
} from "@/lib/ai/tutor/types";
export {
  practicalTaskTypeLabel,
  checkTypeLabel,
  buildPageContextBlock,
  toPracticalContext,
} from "@/lib/ai/tutor/context/page-context";
