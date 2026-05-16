import { NextResponse } from "next/server";
import { z } from "zod";
import type { CheckType, PracticalTaskType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { AiNotConfiguredError, AiProviderError } from "@/lib/ai-config";
import { assertSafeTutorUserMessage } from "@/lib/ai-content-policy";
import {
  checkTypeLabel,
  practicalTaskTypeLabel,
  runTutorChat,
  TUTOR_PRACTICE_SOCRATIC_EXTRA,
  type TutorChatHistoryItem,
  type TutorPageContext,
} from "@/lib/ai-chat";
import { checkModuleAccessForApi, checkPracticeEntry } from "@/lib/course-progress-guards";
import { prisma } from "@/lib/db";
import { formatInterestsDisplay, parseProfileInterests } from "@/lib/profile-interests";
import { consumeRateLimit } from "@/lib/rate-limit";
import { clientIpFromRequest } from "@/lib/request-ip";

/** Принимаем camelCase и snake_case; в модель не попадают лишние поля. */
function normalizeChatBodyJson(raw: unknown): unknown {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return raw;
  const o = raw as Record<string, unknown>;
  return {
    ...o,
    moduleId: o.moduleId ?? o.module_id,
    lessonId: o.lessonId ?? o.lesson_id,
    practicalTaskId: o.practicalTaskId ?? o.practical_task_id,
    practiceSocraticHints: o.practiceSocraticHints ?? o.practice_socratic_hints,
  };
}

const idOrNull = z
  .union([z.string().min(1), z.null()])
  .optional()
  .transform((v) => (v == null ? undefined : v));

const bodySchema = z.object({
  message: z.string().min(1).max(8000),
  moduleId: idOrNull,
  lessonId: idOrNull,
  practicalTaskId: idOrNull,
  /** Усилить режим: только наводящие вопросы, без готового решения практики. */
  practiceSocraticHints: z.boolean().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(12000),
      }),
    )
    .max(24)
    .optional()
    .default([]),
});

function sliceHistory(h: TutorChatHistoryItem[]): TutorChatHistoryItem[] {
  if (h.length <= 24) return h;
  return h.slice(-24);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Требуется авторизация." }, { status: 401 });
  }

  const ip = clientIpFromRequest(req);
  if (
    !consumeRateLimit(`ai:chat:ip:${ip}`, 120, 60 * 60 * 1000) ||
    !consumeRateLimit(`ai:chat:user:${session.user.id}`, 60, 60 * 60 * 1000)
  ) {
    return NextResponse.json({ error: "Превышен лимит запросов к AI. Попробуйте позже." }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(normalizeChatBodyJson(json));
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректное тело запроса.", details: parsed.error.flatten() }, { status: 400 });
  }

  const { message, moduleId: bodyModuleId, lessonId, practicalTaskId, practiceSocraticHints, history } = parsed.data;
  const historySafe = sliceHistory(history);

  const policy = assertSafeTutorUserMessage(message);
  if (!policy.ok) {
    return NextResponse.json({ error: policy.reason }, { status: 400 });
  }

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      profile: true,
    },
  });

  const rawInterests = user?.profile ? formatInterestsDisplay(parseProfileInterests(user.profile.interests)) : "—";
  const interestsLineRaw = rawInterests === "—" ? "не указаны" : rawInterests;
  const interestsLine = interestsLineRaw.length > 2000 ? `${interestsLineRaw.slice(0, 1997)}…` : interestsLineRaw;
  const spec = user?.profile?.specialty?.trim();
  const specialtyLineRaw = spec && spec !== "—" ? spec : "не указана";
  const specialtyLine = specialtyLineRaw.length > 500 ? `${specialtyLineRaw.slice(0, 497)}…` : specialtyLineRaw;

  let lessonRow: { moduleId: string; title: string; content: string } | null = null;
  let taskRow: {
    moduleId: string;
    title: string;
    description: string;
    taskType: PracticalTaskType;
    checkType: CheckType;
  } | null = null;

  if (lessonId) {
    const l = await prisma.lesson.findUnique({
      where: { id: lessonId },
      /** Только заголовок и текст лекции; без связанных тестов и ответов. */
      select: { moduleId: true, title: true, content: true },
    });
    if (!l) {
      return NextResponse.json({ error: "Лекция не найдена." }, { status: 404 });
    }
    const lessonAccess = await checkModuleAccessForApi(userId, l.moduleId);
    if (!lessonAccess.ok) {
      return NextResponse.json({ error: lessonAccess.message }, { status: 403 });
    }
    lessonRow = l;
  }

  if (practicalTaskId) {
    const t = await prisma.practicalTask.findUnique({
      where: { id: practicalTaskId },
      /** Только безопасный контекст для наставника: без scenarioData, expected*, ответов. */
      select: { moduleId: true, title: true, description: true, taskType: true, checkType: true },
    });
    if (!t) {
      return NextResponse.json({ error: "Практическое задание не найдено." }, { status: 404 });
    }
    const practiceAccess = await checkPracticeEntry(userId, t.moduleId);
    if (!practiceAccess.ok) {
      return NextResponse.json({ error: practiceAccess.message }, { status: 403 });
    }
    taskRow = t;
  }

  if (bodyModuleId) {
    const bodyAccess = await checkModuleAccessForApi(userId, bodyModuleId);
    if (!bodyAccess.ok) {
      return NextResponse.json({ error: bodyAccess.message }, { status: 403 });
    }
  }

  if (lessonRow && bodyModuleId && lessonRow.moduleId !== bodyModuleId) {
    return NextResponse.json({ error: "lessonId не относится к указанному moduleId." }, { status: 400 });
  }
  if (taskRow && bodyModuleId && taskRow.moduleId !== bodyModuleId) {
    return NextResponse.json({ error: "practicalTaskId не относится к указанному moduleId." }, { status: 400 });
  }
  if (lessonRow && taskRow && lessonRow.moduleId !== taskRow.moduleId) {
    return NextResponse.json({ error: "Лекция и практика относятся к разным модулям." }, { status: 400 });
  }

  const resolvedModuleId = lessonRow?.moduleId ?? taskRow?.moduleId ?? bodyModuleId;

  let moduleTitle = "не привязано к модулю";
  if (resolvedModuleId) {
    const mod = await prisma.module.findUnique({
      where: { id: resolvedModuleId },
      select: { title: true, isActive: true },
    });
    if (!mod?.isActive) {
      return NextResponse.json({ error: "Модуль недоступен." }, { status: 403 });
    }
    moduleTitle = mod.title;
  }

  const pageContext: TutorPageContext = {
    moduleTitle,
    interestsLine,
    specialtyLine,
  };

  if (lessonRow) {
    pageContext.lessonTitle = lessonRow.title;
    pageContext.lessonExcerpt = lessonRow.content;
  }

  if (taskRow) {
    pageContext.practicalTask = {
      title: taskRow.title,
      description: taskRow.description,
      taskTypeLabel: practicalTaskTypeLabel(taskRow.taskType),
      checkTypeLabel: checkTypeLabel(taskRow.checkType),
    };
  }

  try {
    const reply = await runTutorChat({
      userMessage: message,
      pageContext,
      history: historySafe,
      systemPromptExtra: practiceSocraticHints ? TUTOR_PRACTICE_SOCRATIC_EXTRA : undefined,
    });

    return NextResponse.json({ reply });
  } catch (e) {
    if (e instanceof AiNotConfiguredError) {
      return NextResponse.json({ error: e.message, code: e.code }, { status: 503 });
    }
    if (e instanceof AiProviderError) {
      return NextResponse.json({ error: e.message, code: e.code }, { status: 502 });
    }
    console.error(e);
    return NextResponse.json({ error: "Не удалось получить ответ наставника. Попробуйте позже." }, { status: 500 });
  }
}
