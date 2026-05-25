import {
  sanitizeLessonContentForPrompt,
  sanitizeTaskDescriptionForPrompt,
} from "@/lib/ai/tutor/moderation/lesson-content";
import type { TutorPageContext } from "@/lib/ai/tutor/types";
import type { TutorPipelineMeta, TutorPipelineResult } from "@/lib/ai/tutor/types";
import type {
  AIMentorContext,
  AIMentorMessage,
  AIMentorMode,
  AIMentorResponse,
} from "@/types/ai-mentor";

/** Минимальный TutorPageContext из канонического AIMentorContext. */
export function mapAIMentorContextToTutorPage(
  ctx: AIMentorContext,
  opts: { interestsLine: string; specialtyLine: string; moduleId?: string },
): TutorPageContext {
  const page: TutorPageContext = {
    moduleId: opts.moduleId,
    moduleTitle: ctx.moduleTitle?.trim() || "не привязано к модулю",
    interestsLine: opts.interestsLine,
    specialtyLine: opts.specialtyLine,
  };

  if (ctx.lessonTitle) {
    page.lessonTitle = ctx.lessonTitle;
    if (ctx.safeExcerpt) {
      page.lessonExcerpt = sanitizeLessonContentForPrompt(ctx.safeExcerpt);
    }
  }

  if (ctx.practiceTitle && ctx.sourceType === "practice") {
    page.practicalTask = {
      title: ctx.practiceTitle,
      description: ctx.safeExcerpt
        ? sanitizeTaskDescriptionForPrompt(ctx.safeExcerpt)
        : "Описание задания доступно в интерфейсе практики.",
      taskTypeLabel: "практическое задание",
      checkTypeLabel: "учебная проверка",
    };
  }

  if (ctx.testTitle && ctx.sourceType === "test_result") {
    const weak =
      ctx.weakTopics?.length ? ` Слабые темы: ${ctx.weakTopics.join(", ")}.` : "";
    const strong =
      ctx.strongTopics?.length ? ` Сильные темы: ${ctx.strongTopics.join(", ")}.` : "";
    page.testReviewHint = `${ctx.testTitle}.${weak}${strong}`.slice(0, 400);
  } else if (ctx.weakTopics?.length) {
    page.testReviewHint = `Слабые темы: ${ctx.weakTopics.join(", ")}`.slice(0, 400);
  }

  if (ctx.safeTopic && !page.lessonTitle) {
    page.moduleTitle = ctx.moduleTitle?.trim() || ctx.safeTopic;
  }

  return page;
}

export function buildAIMentorResponseFromPipeline(
  result: TutorPipelineResult,
  opts: { messageId: string; createdAt: string; mode?: AIMentorMode },
): AIMentorResponse {
  const meta = result.meta;
  return {
    message: {
      id: opts.messageId,
      role: "assistant",
      content: result.reply,
      createdAt: opts.createdAt,
      mode: opts.mode,
    },
    refusal: meta.refused,
    safetyReason: refusalReasonFromMeta(meta),
    suggestions: meta.recommendations?.length ? meta.recommendations : undefined,
  };
}

function refusalReasonFromMeta(meta: TutorPipelineMeta): string | undefined {
  if (!meta.refused) return undefined;
  if (meta.refusalCode === "exam_spoiler") {
    return "Запрос похож на просьбу о готовом ответе на проверку.";
  }
  if (meta.refusalCode === "offensive_attack") {
    return "Атакующие инструкции не поддерживаются.";
  }
  if (meta.refusalCode === "prompt_injection") {
    return "Сообщение не прошло проверку безопасности.";
  }
  return "Ответ ограничен политикой обучения.";
}

export function buildAIMentorUserMessage(
  content: string,
  opts: { id: string; createdAt: string; mode?: AIMentorMode },
): AIMentorMessage {
  return {
    id: opts.id,
    role: "user",
    content,
    createdAt: opts.createdAt,
    mode: opts.mode,
  };
}
