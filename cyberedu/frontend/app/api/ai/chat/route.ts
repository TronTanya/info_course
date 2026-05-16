import { NextResponse } from "next/server";
import { z } from "zod";
import type { CheckType, PracticalTaskType } from "@prisma/client";
import { AiNotConfiguredError, AiProviderError } from "@/lib/ai-config";
import { checkModuleAccessForApi, checkPracticeEntry } from "@/lib/course-progress-guards";
import { prisma } from "@/lib/db";
import { formatInterestsDisplay, parseProfileInterests } from "@/lib/profile-interests";
import { toPracticalContext } from "@/lib/ai/tutor";
import {
  appendTrustedChatTurns,
  buildTutorScopeKey,
  loadTrustedChatHistory,
} from "@/lib/ai/tutor/context/chat-history-store";
import { validateUntrustedClientHistory } from "@/lib/ai/tutor/moderation/history";
import { auditUntrustedClientHistory } from "@/lib/ai/tutor/moderation/audit";
import { runTutorPipeline } from "@/lib/ai/tutor/pipeline";
import type { TutorPageContext } from "@/lib/ai/tutor/types";
import { securityAudit } from "@/lib/security/audit";
import { withAuthApiRoute } from "@/lib/security/api-guard";

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

const chatBodySchema = z.preprocess(
  normalizeChatBodyJson,
  z.object({
    message: z.string().min(1).max(8000),
    moduleId: idOrNull,
    lessonId: idOrNull,
    practicalTaskId: idOrNull,
    practiceSocraticHints: z.boolean().optional(),
    /** Игнорируется для LLM; история на сервере. */
    history: z.array(z.unknown()).max(8).optional().default([]),
  }),
);

type ChatBody = z.infer<typeof chatBodySchema>;

export const POST = withAuthApiRoute(
  { rateLimit: "aiChat", bodySchema: chatBodySchema },
  async ({ userId, ip, body }) => {
  const {
    message,
    moduleId: bodyModuleId,
    lessonId,
    practicalTaskId,
    practiceSocraticHints,
    history: clientHistoryRaw,
  } = body;

  const clientHistoryCheck = validateUntrustedClientHistory(clientHistoryRaw);
  if (clientHistoryCheck.droppedAssistant > 0 || clientHistoryCheck.issues.length > 0) {
    auditUntrustedClientHistory(userId, clientHistoryCheck.droppedAssistant, clientHistoryCheck.issues);
  }

  const scopeKey = buildTutorScopeKey({
    moduleId: bodyModuleId,
    lessonId,
    practicalTaskId,
  });
  const trustedHistory = await loadTrustedChatHistory(userId, scopeKey);

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
      history: trustedHistory,
      practiceSocraticHints,
      lessonId,
      practicalTaskId,
      persistHistory: (userMsg, assistantReply) =>
        appendTrustedChatTurns(userId, scopeKey, userMsg, assistantReply),
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
  },
);
