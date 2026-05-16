import { NextResponse } from "next/server";
import { z } from "zod";
import type { CheckType, PracticalTaskType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { AiNotConfiguredError, AiProviderError } from "@/lib/ai-config";
import { checkModuleAccessForApi, checkPracticeEntry } from "@/lib/course-progress-guards";
import { prisma } from "@/lib/db";
import { formatInterestsDisplay, parseProfileInterests } from "@/lib/profile-interests";
import { toPracticalContext } from "@/lib/ai/tutor";
import { runTutorPipeline } from "@/lib/ai/tutor/pipeline";
import type { TutorPageContext } from "@/lib/ai/tutor/types";
import { securityAudit } from "@/lib/security/audit";
import { consumeCompositeRateLimit } from "@/lib/security/rate-limit";
import { clientIpFromRequest } from "@/lib/security/request-ip";

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

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Требуется авторизация." }, { status: 401 });
  }

  const userId = session.user.id;
  const ip = clientIpFromRequest(req);

  const rl = await consumeCompositeRateLimit({
    ipKey: `ai:chat:ip:${ip}`,
    userKey: `ai:chat:user:${userId}`,
    ipMax: 120,
    userMax: 60,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.allowed) {
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

  const {
    message,
    moduleId: bodyModuleId,
    lessonId,
    practicalTaskId,
    practiceSocraticHints,
    history,
  } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { profile: true },
  });

  const rawInterests = user?.profile ? formatInterestsDisplay(parseProfileInterests(user.profile.interests)) : "—";
  const interestsLine = rawInterests === "—" ? "не указаны" : rawInterests.slice(0, 2000);
  const spec = user?.profile?.specialty?.trim();
  const specialtyLine = spec && spec !== "—" ? spec.slice(0, 500) : "не указана";

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
      select: { moduleId: true, title: true, content: true },
    });
    if (!l) return NextResponse.json({ error: "Лекция не найдена." }, { status: 404 });
    const lessonAccess = await checkModuleAccessForApi(userId, l.moduleId);
    if (!lessonAccess.ok) return NextResponse.json({ error: lessonAccess.message }, { status: 403 });
    lessonRow = l;
  }

  if (practicalTaskId) {
    const t = await prisma.practicalTask.findUnique({
      where: { id: practicalTaskId },
      select: { moduleId: true, title: true, description: true, taskType: true, checkType: true },
    });
    if (!t) return NextResponse.json({ error: "Практическое задание не найдено." }, { status: 404 });
    const practiceAccess = await checkPracticeEntry(userId, t.moduleId);
    if (!practiceAccess.ok) return NextResponse.json({ error: practiceAccess.message }, { status: 403 });
    taskRow = t;
  }

  if (bodyModuleId) {
    const bodyAccess = await checkModuleAccessForApi(userId, bodyModuleId);
    if (!bodyAccess.ok) return NextResponse.json({ error: bodyAccess.message }, { status: 403 });
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
      select: { title: true, isActive: true, orderNumber: true },
    });
    if (!mod?.isActive) return NextResponse.json({ error: "Модуль недоступен." }, { status: 403 });
    moduleTitle = mod.title;
  }

  const pageContext: TutorPageContext = {
    moduleId: resolvedModuleId,
    moduleTitle,
    interestsLine,
    specialtyLine,
  };

  if (lessonRow) {
    pageContext.lessonTitle = lessonRow.title;
    pageContext.lessonExcerpt = lessonRow.content;
  }
  if (taskRow) {
    pageContext.practicalTask = toPracticalContext(taskRow);
  }

  try {
    const result = await runTutorPipeline({
      userId,
      userMessage: message,
      pageContext,
      history,
      practiceSocraticHints,
      lessonId,
      practicalTaskId,
    });

    return NextResponse.json({
      reply: result.reply,
      meta: result.meta,
    });
  } catch (e) {
    if (e instanceof AiNotConfiguredError) {
      return NextResponse.json({ error: e.message, code: e.code }, { status: 503 });
    }
    if (e instanceof AiProviderError) {
      return NextResponse.json({ error: e.message, code: e.code }, { status: 502 });
    }
    console.error(e);
    securityAudit({
      event: "ai.tutor.unhandled_error",
      severity: "high",
      actorId: userId,
      ip,
      path: "/api/ai/chat",
    });
    return NextResponse.json({ error: "Не удалось получить ответ наставника. Попробуйте позже." }, { status: 500 });
  }
}
