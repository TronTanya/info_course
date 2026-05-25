import { NextResponse } from "next/server";
import type { CheckType, PracticalTaskType } from "@prisma/client";
import { checkModuleAccessForApi, checkPracticeEntry } from "@/lib/course-progress-guards";
import { prisma } from "@/lib/db";
import { formatInterestsDisplay, parseProfileInterests } from "@/lib/profile-interests";
import {
  appendTrustedChatTurns,
  buildTutorScopeKey,
  loadTrustedChatHistory,
} from "@/lib/ai/tutor/context/chat-history-store";
import { validateUntrustedClientHistory } from "@/lib/ai/tutor/moderation/history";
import { auditUntrustedClientHistory } from "@/lib/ai/tutor/moderation/audit";
import { buildServerAIMentorContext } from "@/lib/ai/mentor-ui/build-server-context";
import { shouldPersistTutorChatHistory } from "@/lib/ai/tutor/context/chat-history-policy";
import { resolveMentorSurface } from "@/lib/ai/mentor-ui/surfaces";
import { runTutorPipeline } from "@/lib/ai/tutor/pipeline";
import {
  assertMentorChatConfigured,
  auditMentorContextStripped,
  handleMentorChatRouteError,
  mentorChatBodySchema,
  sanitizeTutorMetaForClient,
} from "@/lib/ai/mentor-chat-api";
import { withAuthApiRoute } from "@/lib/security/api-guard";

export const POST = withAuthApiRoute(
  { rateLimit: "aiChat", bodySchema: mentorChatBodySchema },
  async ({ userId, ip, body }) => {
    const notConfigured = assertMentorChatConfigured();
    if (notConfigured) return notConfigured;

    const {
      message,
      moduleId: bodyModuleId,
      lessonId,
      practicalTaskId,
      practiceSocraticHints,
      mentorModeId,
      testReviewHint,
      testDebriefTopics,
      mentorContext,
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

    const [trustedHistory, user, lessonFetch, taskFetch] = await Promise.all([
      loadTrustedChatHistory(userId, scopeKey),
      prisma.user.findUnique({
        where: { id: userId },
        select: { profile: true },
      }),
      lessonId
        ? prisma.lesson.findUnique({
            where: { id: lessonId },
            select: { moduleId: true, title: true, content: true },
          })
        : Promise.resolve(null),
      practicalTaskId
        ? prisma.practicalTask.findUnique({
            where: { id: practicalTaskId },
            select: { moduleId: true, title: true, description: true, taskType: true, checkType: true },
          })
        : Promise.resolve(null),
    ]);

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

    if (lessonId && !lessonFetch) {
      return NextResponse.json({ error: "Лекция не найдена." }, { status: 404 });
    }
    if (practicalTaskId && !taskFetch) {
      return NextResponse.json({ error: "Практическое задание не найдено." }, { status: 404 });
    }

    const [lessonAccess, practiceAccess, bodyAccess] = await Promise.all([
      lessonFetch ? checkModuleAccessForApi(userId, lessonFetch.moduleId) : Promise.resolve({ ok: true as const }),
      taskFetch ? checkPracticeEntry(userId, taskFetch.moduleId) : Promise.resolve({ ok: true as const }),
      bodyModuleId ? checkModuleAccessForApi(userId, bodyModuleId) : Promise.resolve({ ok: true as const }),
    ]);

    if (lessonFetch && !lessonAccess.ok) {
      return NextResponse.json({ error: lessonAccess.message }, { status: 403 });
    }
    if (taskFetch && !practiceAccess.ok) {
      return NextResponse.json({ error: practiceAccess.message }, { status: 403 });
    }
    if (bodyModuleId && !bodyAccess.ok) {
      return NextResponse.json({ error: bodyAccess.message }, { status: 403 });
    }

    if (lessonFetch) lessonRow = lessonFetch;
    if (taskFetch) taskRow = taskFetch;

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

    const hint = testReviewHint?.trim()?.slice(0, 400);

    const mentorSurface = resolveMentorSurface({
      lessonId,
      practicalTaskId,
      moduleId: resolvedModuleId,
      labels: hint ? { testSummary: hint } : undefined,
    });

    const { pageContext, strippedClientKeys } = buildServerAIMentorContext(
      {
        mentorSurface,
        moduleId: resolvedModuleId,
        moduleTitle,
        lessonId,
        lessonTitle: lessonRow?.title,
        lessonContent: lessonRow?.content,
        practicalTaskId,
        practiceTitle: taskRow?.title,
        practiceDescription: taskRow?.description,
        testReviewHint: hint,
        testDebriefTopics,
        mentorModeId: mentorModeId ?? undefined,
        clientContext: mentorContext,
      },
      { interestsLine, specialtyLine },
    );

    auditMentorContextStripped(userId, strippedClientKeys, ip);

    try {
      const result = await runTutorPipeline({
        userId,
        userMessage: message,
        pageContext,
        history: trustedHistory,
        practiceSocraticHints,
        mentorModeId,
        mentorSurface,
        lessonId,
        practicalTaskId,
        persistHistory: shouldPersistTutorChatHistory(mentorSurface)
          ? (userMsg, assistantReply) =>
              appendTrustedChatTurns(userId, scopeKey, userMsg, assistantReply)
          : undefined,
      });

      return NextResponse.json({
        reply: result.reply,
        meta: sanitizeTutorMetaForClient(result.meta),
      });
    } catch (e) {
      return handleMentorChatRouteError(e, { userId, ip, path: "/api/ai/chat" });
    }
  },
);
