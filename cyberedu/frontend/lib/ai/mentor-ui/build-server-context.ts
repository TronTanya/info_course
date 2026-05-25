import {
  sanitizeLessonContentForPrompt,
  sanitizeTaskDescriptionForPrompt,
} from "@/lib/ai/tutor/moderation/lesson-content";
import { sanitizeAIContext } from "@/lib/ai/safety/mentor-policy";
import {
  isUserDraftAllowedForMode,
  mapServerToAIMentorContext,
  mentorSurfaceToSourceType,
} from "@/lib/ai/mentor-ui/safe-context-mapper";
import { sanitizeMentorClientHint } from "@/lib/ai/mentor-ui/sanitize-hint";
import type { MentorSurface } from "@/lib/ai/mentor-ui/surfaces";
import { mapAIMentorContextToTutorPage } from "@/lib/ai/mentor-ui/tutor-bridge";
import type { TutorPageContext } from "@/lib/ai/tutor/types";
import type { AIMentorContext, AIMentorContextInput, AIMentorMode } from "@/types/ai-mentor";

export type BuildServerAIMentorContextInput = {
  mentorSurface: MentorSurface;
  moduleId?: string;
  moduleTitle: string;
  lessonId?: string;
  lessonTitle?: string;
  lessonContent?: string;
  practicalTaskId?: string;
  practiceTitle?: string;
  practiceDescription?: string;
  testReviewHint?: string;
  testDebriefTopics?: string;
  mentorModeId?: AIMentorMode;
  /** Не доверенный ввод с клиента — только после sanitizeAIMentorContextInput. */
  clientContext?: AIMentorContextInput | Record<string, unknown> | null;
};

export type BuildServerAIMentorContextResult = {
  aiContext: AIMentorContext;
  pageContext: TutorPageContext;
  strippedClientKeys: string[];
};

function weakTopicsFromDebrief(debrief: string | undefined): string[] | undefined {
  if (!debrief) return undefined;
  const parts = debrief
    .split(/[;,\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2 && s.length < 80);
  return parts.length ? parts.slice(0, 8) : undefined;
}

/**
 * Собирает минимальный AIMentorContext из данных БД + безопасных клиентских подсказок.
 * Серверные excerpt всегда из lesson/task row, не из clientContext.
 */
export function buildServerAIMentorContext(
  input: BuildServerAIMentorContextInput,
  profile: { interestsLine: string; specialtyLine: string },
): BuildServerAIMentorContextResult {
  const sourceType = mentorSurfaceToSourceType(input.mentorSurface);
  const sourceId = input.lessonId ?? input.practicalTaskId ?? input.moduleId;

  const testHint = input.testReviewHint?.trim();
  const debrief = sanitizeMentorClientHint(input.testDebriefTopics);

  let safeExcerpt: string | undefined;
  if (input.lessonContent?.trim()) {
    safeExcerpt = sanitizeLessonContentForPrompt(input.lessonContent.trim());
  } else if (input.practiceDescription?.trim()) {
    safeExcerpt = sanitizeTaskDescriptionForPrompt(input.practiceDescription.trim());
  }

  const allowUserDraft = isUserDraftAllowedForMode(input.mentorModeId, sourceType);

  const base = mapServerToAIMentorContext({
    sourceType,
    sourceId,
    moduleTitle: input.moduleTitle,
    lessonTitle: input.lessonTitle,
    practiceTitle: input.practiceTitle,
    testTitle: testHint ? testHint.slice(0, 200) : undefined,
    safeTopic: input.practiceTitle ?? input.lessonTitle ?? input.moduleTitle,
    safeExcerpt,
    weakTopics: weakTopicsFromDebrief(debrief),
    allowUserDraft,
  });

  let strippedClientKeys: string[] = [];
  if (input.clientContext) {
    const { context: overlay, strippedKeys } = sanitizeAIContext(input.clientContext, {
      allowUserDraft,
      defaultSourceType: sourceType,
    });
    strippedClientKeys = strippedKeys;
    if (overlay.weakTopics?.length) {
      base.weakTopics = overlay.weakTopics;
    }
    if (overlay.strongTopics?.length) {
      base.strongTopics = overlay.strongTopics;
    }
    if (overlay.safeTopic) {
      base.safeTopic = overlay.safeTopic;
    }
    if (overlay.testTitle) {
      base.testTitle = overlay.testTitle;
    }
    if (overlay.lessonTitle) {
      base.lessonTitle = overlay.lessonTitle;
    }
    if (overlay.practiceTitle) {
      base.practiceTitle = overlay.practiceTitle;
    }
    if (overlay.moduleTitle) {
      base.moduleTitle = overlay.moduleTitle;
    }
    // Клиентский excerpt только если нет доверенного фрагмента из БД (уже прошёл sanitize).
    if (!safeExcerpt && overlay.safeExcerpt) {
      base.safeExcerpt = overlay.safeExcerpt;
    }
    if (overlay.userDraft && allowUserDraft) {
      base.userDraft = overlay.userDraft;
    }
  }

  const pageContext = mapAIMentorContextToTutorPage(base, {
    moduleId: input.moduleId,
    interestsLine: profile.interestsLine,
    specialtyLine: profile.specialtyLine,
  });

  if (debrief) {
    pageContext.testDebriefTopics = debrief;
  }
  if (testHint) {
    pageContext.testReviewHint = testHint.slice(0, 400);
  }

  return { aiContext: base, pageContext, strippedClientKeys };
}
