"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { AiNotConfiguredError, AiProviderError } from "@/lib/ai-config";
import { assertModuleAccess, isProgressAccessError } from "@/lib/course-progress-guards";
import { parseLessonAiMeta } from "@/lib/lesson-ai-meta";
import { completeLesson } from "@/lib/progress";
import { enforceServerActionRateLimit } from "@/lib/security/server-action-rate-limit";
import {
  getLessonAiSnapshots,
  runLessonAiPipeline,
  safeParseLessonAiAction,
} from "@/lib/lesson-ai-service";

export type LessonActionState = {
  ok?: boolean;
  error?: string;
};

function revalidateLessonPaths(moduleId: string) {
  revalidatePath(`/dashboard/course/${moduleId}/lesson`);
  revalidatePath(`/dashboard/course/${moduleId}`);
  revalidatePath("/dashboard/course");
}

export async function markLessonStudiedAction(moduleId: string): Promise<LessonActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Требуется вход." };
  await assertModuleAccess(session.user.id, moduleId);
  const ok = await completeLesson(session.user.id, moduleId);
  if (!ok) return { error: "Не удалось сохранить прогресс (модуль недоступен)." };
  revalidateLessonPaths(moduleId);
  return { ok: true };
}

export async function runLessonAiAction(input: {
  moduleId: string;
  lessonId: string;
  action: string;
  question?: string;
}): Promise<LessonActionState & { adaptation?: { id: string; adaptedContent: string; interestsUsed: string; createdAt: Date } }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Требуется вход." };
  const rateLimit = await enforceServerActionRateLimit("aiLessonAdapt", session.user.id, {
    exceeded: "Слишком много AI-запросов к лекции. Подождите и попробуйте позже.",
  });
  if (!rateLimit.allowed) return { error: rateLimit.error };

  const action = safeParseLessonAiAction(input.action);
  if (!action) return { error: "Неизвестное действие AI." };

  if (action === "ask_assistant" && !input.question?.trim()) {
    return { error: "Введите вопрос для ассистента." };
  }

  try {
    const row = await runLessonAiPipeline({
      userId: session.user.id,
      moduleId: input.moduleId,
      lessonId: input.lessonId,
      action,
      question: input.question?.trim(),
    });
    revalidateLessonPaths(input.moduleId);
    return {
      ok: true,
      adaptation: {
        id: row.id,
        adaptedContent: row.adaptedContent,
        interestsUsed: row.interestsUsed,
        createdAt: row.createdAt,
      },
    };
  } catch (e) {
    if (e instanceof AiNotConfiguredError) return { error: e.message };
    if (e instanceof AiProviderError) return { error: e.message };
    if (isProgressAccessError(e)) return { error: e.message };
    const code = e instanceof Error ? e.message : "";
    if (code === "AI_DISABLED_FOR_LESSON") return { error: "Для этой лекции отключена AI-адаптация." };
    if (code === "LESSON_NOT_IN_MODULE" || code === "LESSON_NOT_FOUND") return { error: "Лекция не найдена." };
    console.error(e);
    return { error: "Не удалось выполнить запрос. Попробуйте позже." };
  }
}

export async function regenerateLessonAiAction(input: {
  moduleId: string;
  lessonId: string;
  /** Что перегенерировать: объяснение (по умолчанию) или конспект. */
  kind?: "explanation" | "summary";
}): Promise<LessonActionState & { adaptation?: { id: string; adaptedContent: string; interestsUsed: string; createdAt: Date } }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Требуется вход." };

  const kind = input.kind ?? "explanation";
  const snaps = await getLessonAiSnapshots(session.user.id, input.lessonId);
  const target = kind === "summary" ? snaps.summary : snaps.explanation;
  if (!target) {
    return {
      error:
        kind === "summary"
          ? "Нет сохранённого конспекта для повторной генерации."
          : "Нет сохранённого AI-объяснения для повторной генерации.",
    };
  }

  const meta = parseLessonAiMeta(target.interestsUsed);
  if (!meta) return { error: "Не удалось прочитать параметры последней генерации." };

  return await runLessonAiAction({
    moduleId: input.moduleId,
    lessonId: input.lessonId,
    action: meta.action,
    question: meta.question,
  });
}
