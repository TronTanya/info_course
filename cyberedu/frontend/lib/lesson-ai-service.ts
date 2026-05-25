import { prisma } from "@/lib/db";
import { checkModuleAccessForApi, ProgressAccessError } from "@/lib/course-progress-guards";
import { formatInterestsDisplay, parseProfileInterests } from "@/lib/profile-interests";
import { getLessonAiGenerator } from "@/lib/ai/lesson-generator";
import { isLessonAiAction, parseLessonAiMeta, serializeLessonAiMeta, type LessonAiAction, type LessonAiMetaV1 } from "@/lib/lesson-ai-meta";

export async function getLessonForModulePage(moduleId: string) {
  return prisma.lesson.findFirst({
    where: { moduleId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      title: true,
      content: true,
      videoUrl: true,
      allowAiAdaptation: true,
      moduleId: true,
    },
  });
}

export type LessonAiAdaptationSnapshot = {
  id: string;
  adaptedContent: string;
  interestsUsed: string;
  createdAt: Date;
};

export async function getLatestLessonAiAdaptation(userId: string, lessonId: string) {
  return prisma.aiAdaptation.findFirst({
    where: { userId, lessonId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      adaptedContent: true,
      interestsUsed: true,
      createdAt: true,
    },
  });
}

const EXPLANATION_ACTIONS: LessonAiAction[] = ["simpler", "adapt_interests", "example", "ask_assistant"];

/** Последние отдельные снимки: объяснение (не конспект) и конспект. */
export async function getLessonAiSnapshots(
  userId: string,
  lessonId: string,
): Promise<{ explanation: LessonAiAdaptationSnapshot | null; summary: LessonAiAdaptationSnapshot | null }> {
  const rows = await prisma.aiAdaptation.findMany({
    where: { userId, lessonId },
    orderBy: { createdAt: "desc" },
    take: 24,
    select: {
      id: true,
      adaptedContent: true,
      interestsUsed: true,
      createdAt: true,
    },
  });

  let explanation: LessonAiAdaptationSnapshot | null = null;
  let summary: LessonAiAdaptationSnapshot | null = null;

  for (const r of rows) {
    const m = parseLessonAiMeta(r.interestsUsed);
    if (!m) continue;
    if (m.action === "summary" && !summary) {
      summary = r;
    } else if (EXPLANATION_ACTIONS.includes(m.action) && !explanation) {
      explanation = r;
    }
    if (summary && explanation) break;
  }

  return { explanation, summary };
}

/**
 * Генерация AI-текста и запись в `AiAdaptation` (оригинал лекции дублируется в строке для аудита).
 */
export async function runLessonAiPipeline(input: {
  userId: string;
  moduleId: string;
  lessonId: string;
  action: LessonAiAction;
  question?: string;
}) {
  const [access, lesson, user] = await Promise.all([
    checkModuleAccessForApi(input.userId, input.moduleId),
    prisma.lesson.findFirst({
      where: { id: input.lessonId, moduleId: input.moduleId },
      select: { id: true, title: true, content: true, allowAiAdaptation: true },
    }),
    prisma.user.findUnique({
      where: { id: input.userId },
      select: { id: true, profile: true },
    }),
  ]);

  if (!access.ok) {
    throw new ProgressAccessError(access.code, access.message);
  }
  if (!lesson) throw new Error("LESSON_NOT_FOUND");
  if (!lesson.allowAiAdaptation) {
    throw new Error("AI_DISABLED_FOR_LESSON");
  }
  const rawLine = user?.profile ? formatInterestsDisplay(parseProfileInterests(user.profile.interests)) : "—";
  const interestsLine = rawLine === "—" ? "не указаны" : rawLine;
  const spec = user?.profile?.specialty?.trim();
  const userSpecialty = spec && spec !== "—" ? spec : "";
  const specialtySnapshot = spec && spec !== "—" ? spec : undefined;

  const generator = getLessonAiGenerator();
  const adaptedContent = await generator.generate({
    action: input.action,
    lessonTitle: lesson.title,
    lessonContent: lesson.content,
    interestsPromptBlock: interestsLine,
    userSpecialty,
    userQuestion: input.question,
  });

  const meta: LessonAiMetaV1 = {
    v: 1,
    action: input.action,
    ...(input.question?.trim() ? { question: input.question.trim() } : {}),
    interestsSnapshot: rawLine,
    ...(specialtySnapshot ? { specialtySnapshot } : {}),
  };

  return prisma.aiAdaptation.create({
    data: {
      userId: input.userId,
      lessonId: lesson.id,
      originalContent: lesson.content,
      adaptedContent,
      interestsUsed: serializeLessonAiMeta(meta),
    },
    select: {
      id: true,
      adaptedContent: true,
      interestsUsed: true,
      createdAt: true,
    },
  });
}

export function safeParseLessonAiAction(value: unknown): LessonAiAction | null {
  if (typeof value !== "string") return null;
  return isLessonAiAction(value) ? value : null;
}
