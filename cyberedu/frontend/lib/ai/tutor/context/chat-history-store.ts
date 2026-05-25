import { prisma } from "@/lib/db";
import { moderateAiOutput, moderateUserPrompt } from "@/lib/security/ai-moderation";
import { CHAT_HISTORY_LIMITS, prepareTrustedChatHistory } from "@/lib/ai/tutor/moderation/history";
import { MENTOR_CHAT_HISTORY_UI_LIMIT } from "@/lib/ai/tutor/context/chat-history-policy";
import type { MentorChatTurn } from "@/lib/ai/mentor-ui/types";
import type { TutorChatTurn } from "@/lib/ai/tutor/types";

export function buildTutorScopeKey(params: {
  moduleId?: string | null;
  lessonId?: string | null;
  practicalTaskId?: string | null;
}): string {
  const m = params.moduleId?.trim() ?? "";
  const l = params.lessonId?.trim() ?? "";
  const p = params.practicalTaskId?.trim() ?? "";
  return `m:${m}|l:${l}|p:${p}`;
}

/**
 * Загружает доверенную историю диалога с сервера (assistant только из БД).
 */
export async function loadTrustedChatHistory(
  userId: string,
  scopeKey: string,
): Promise<TutorChatTurn[]> {
  const thread = await prisma.tutorChatThread.findUnique({
    where: { userId_scopeKey: { userId, scopeKey } },
    select: {
      messages: {
        orderBy: { createdAt: "asc" },
        select: { role: true, content: true },
      },
    },
  });

  if (!thread?.messages.length) return [];

  const raw: TutorChatTurn[] = [];
  for (const m of thread.messages) {
    if (m.role !== "user" && m.role !== "assistant") continue;
    raw.push({ role: m.role, content: m.content });
  }

  return prepareTrustedChatHistory(raw);
}

/**
 * История для UI: id, timestamp, контент после модерации (без meta и без клиентского assistant).
 */
export async function loadMentorChatHistoryForDisplay(
  userId: string,
  scopeKey: string,
): Promise<MentorChatTurn[]> {
  const thread = await prisma.tutorChatThread.findUnique({
    where: { userId_scopeKey: { userId, scopeKey } },
    select: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: MENTOR_CHAT_HISTORY_UI_LIMIT,
        select: { id: true, role: true, content: true, createdAt: true },
      },
    },
  });

  if (!thread?.messages.length) return [];

  const out: MentorChatTurn[] = [];
  const maxLen = CHAT_HISTORY_LIMITS.maxItemChars;
  const chronological = [...thread.messages].reverse();

  for (const m of chronological) {
    if (m.role !== "user" && m.role !== "assistant") continue;
    let content = m.content;
    if (m.role === "user") {
      const mod = moderateUserPrompt(content, maxLen);
      if (!mod.ok) continue;
      content = mod.text;
    } else {
      const mod = moderateAiOutput(content, 8, maxLen);
      if (!mod.ok) continue;
      content = mod.text;
    }
    out.push({
      id: m.id,
      role: m.role,
      content,
      createdAt: m.createdAt.toISOString(),
    });
  }

  return out;
}

/** Удаляет серверную историю по scope (clear conversation). */
export async function clearTrustedChatHistory(userId: string, scopeKey: string): Promise<void> {
  await prisma.tutorChatThread.deleteMany({
    where: { userId, scopeKey },
  });
}

/**
 * Сохраняет пару реплик после ответа наставника (или безопасного отказа).
 */
export async function appendTrustedChatTurns(
  userId: string,
  scopeKey: string,
  userMessage: string,
  assistantMessage: string,
): Promise<void> {
  const userContent = userMessage.trim().slice(0, 4_000);
  const assistantContent = assistantMessage.trim().slice(0, 8_000);
  if (!userContent || !assistantContent) return;

  const thread = await prisma.tutorChatThread.upsert({
    where: { userId_scopeKey: { userId, scopeKey } },
    create: { userId, scopeKey },
    update: { updatedAt: new Date() },
    select: { id: true },
  });

  await prisma.$transaction([
    prisma.tutorChatMessage.create({
      data: { threadId: thread.id, role: "user", content: userContent },
    }),
    prisma.tutorChatMessage.create({
      data: { threadId: thread.id, role: "assistant", content: assistantContent },
    }),
  ]);

  const overflow = await prisma.tutorChatMessage.count({ where: { threadId: thread.id } });
  const keepPairs = 24;
  if (overflow > keepPairs * 2) {
    const oldest = await prisma.tutorChatMessage.findMany({
      where: { threadId: thread.id },
      orderBy: { createdAt: "asc" },
      take: overflow - keepPairs * 2,
      select: { id: true },
    });
    if (oldest.length) {
      await prisma.tutorChatMessage.deleteMany({
        where: { id: { in: oldest.map((o) => o.id) } },
      });
    }
  }
}
