import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { AiNotConfiguredError, AiProviderError } from "@/lib/ai-config";
import { apiModeToLessonAiAction, type LessonAdaptMode } from "@/lib/ai";
import { prisma } from "@/lib/db";
import { checkModuleAccessForApi, isProgressAccessError } from "@/lib/course-progress-guards";
import { runLessonAiPipeline } from "@/lib/lesson-ai-service";
import { consumeRateLimit } from "@/lib/rate-limit";
import { clientIpFromRequest } from "@/lib/request-ip";

const LESSON_MODES = ["simplify", "adapt_to_interests", "example", "summary"] as const satisfies readonly LessonAdaptMode[];

const bodySchema = z
  .object({
    lesson_id: z.string().min(1).optional(),
    lessonId: z.string().min(1).optional(),
    mode: z.enum(LESSON_MODES),
  })
  .transform((d) => ({
    lessonId: (d.lesson_id ?? d.lessonId ?? "").trim(),
    mode: d.mode,
  }))
  .refine((d) => d.lessonId.length > 0, { message: "Укажите lesson_id или lessonId." });

/**
 * AI-адаптация лекции: авторизация, доступ к модулю, профиль (интересы и специальность), промпт, вызов модели,
 * сохранение в `AiAdaptation`. Оригинальный текст лекции в БД не меняется.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Требуется авторизация." }, { status: 401 });
  }

  const ip = clientIpFromRequest(req);
  if (
    !consumeRateLimit(`ai:adapt:ip:${ip}`, 80, 60 * 60 * 1000) ||
    !consumeRateLimit(`ai:adapt:user:${session.user.id}`, 40, 60 * 60 * 1000)
  ) {
    return NextResponse.json({ error: "Превышен лимит запросов к AI. Попробуйте позже." }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректное тело запроса.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { lessonId, mode } = parsed.data;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      title: true,
      content: true,
      moduleId: true,
      allowAiAdaptation: true,
    },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Лекция не найдена." }, { status: 404 });
  }

  if (!lesson.allowAiAdaptation) {
    return NextResponse.json({ error: "AI-адаптация для этой лекции отключена." }, { status: 403 });
  }

  const access = await checkModuleAccessForApi(session.user.id, lesson.moduleId);
  if (!access.ok) {
    return NextResponse.json({ error: access.message }, { status: 403 });
  }

  const action = apiModeToLessonAiAction(mode);

  try {
    const row = await runLessonAiPipeline({
      userId: session.user.id,
      moduleId: lesson.moduleId,
      lessonId: lesson.id,
      action,
    });

    revalidatePath(`/dashboard/course/${lesson.moduleId}/lesson`);
    revalidatePath(`/dashboard/course/${lesson.moduleId}`);
    revalidatePath("/dashboard/course");

    return NextResponse.json({
      adaptedContent: row.adaptedContent,
      interestsUsed: row.interestsUsed,
      mode,
      action,
      createdAt: row.createdAt.toISOString(),
    });
  } catch (e) {
    if (e instanceof AiNotConfiguredError) {
      return NextResponse.json({ error: e.message, code: e.code }, { status: 503 });
    }
    if (e instanceof AiProviderError) {
      return NextResponse.json({ error: e.message, code: e.code }, { status: 502 });
    }
    if (isProgressAccessError(e)) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }
    const code = e instanceof Error ? e.message : "";
    if (code === "LESSON_NOT_FOUND" || code === "LESSON_NOT_IN_MODULE") {
      return NextResponse.json({ error: "Лекция не найдена или недоступна." }, { status: 404 });
    }
    if (code === "AI_DISABLED_FOR_LESSON") {
      return NextResponse.json({ error: "AI-адаптация для этой лекции отключена." }, { status: 403 });
    }
    console.error(e);
    return NextResponse.json({ error: "Не удалось выполнить адаптацию. Попробуйте позже." }, { status: 500 });
  }
}
