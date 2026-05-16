import { prisma } from "@/lib/db";
import { classifyTutorTopic } from "@/lib/ai/tutor/classification/topics";
import { resolveTutorDifficulty } from "@/lib/ai/tutor/difficulty/adaptive";
import type {
  LearnerMemorySnapshot,
  TutorChatTurn,
  TutorPageContext,
  TutorTopic,
} from "@/lib/ai/tutor/types";

function summarizeConversation(history: TutorChatTurn[], maxLines = 6): string {
  const lines: string[] = [];
  for (const h of history.slice(-maxLines)) {
    const short = h.content.replace(/\s+/g, " ").trim().slice(0, 120);
    if (!short) continue;
    lines.push(h.role === "user" ? `Вопрос: ${short}` : `Было: ${short}`);
  }
  return lines.length ? lines.join("\n") : "Диалог только начинается.";
}

/**
 * Память / контекст ученика из БД + истории чата (без email и ФИО).
 */
export async function buildLearnerMemory(
  userId: string,
  pageContext: TutorPageContext,
  history: TutorChatTurn[],
): Promise<LearnerMemorySnapshot> {
  const course = await prisma.course.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  let completedModules = 0;
  let totalActiveModules = 0;
  let currentModuleProgress: LearnerMemorySnapshot["currentModuleProgress"];

  if (course) {
    const modules = await prisma.module.findMany({
      where: { courseId: course.id, isActive: true },
      select: { id: true, orderNumber: true },
      orderBy: { orderNumber: "asc" },
    });
    totalActiveModules = modules.length;
    const moduleIds = modules.map((m) => m.id);

    if (moduleIds.length) {
      const progress = await prisma.progress.findMany({
        where: { userId, moduleId: { in: moduleIds } },
        select: {
          moduleId: true,
          moduleCompleted: true,
          lessonCompleted: true,
          videoCompleted: true,
          testCompleted: true,
          practiceCompleted: true,
        },
      });
      completedModules = progress.filter((p) => p.moduleCompleted).length;

      const mid = pageContext.moduleId;
      if (mid) {
        const row = progress.find((p) => p.moduleId === mid);
        if (row) {
          currentModuleProgress = {
            lessonDone: row.lessonCompleted,
            videoDone: row.videoCompleted,
            testDone: row.testCompleted,
            practiceDone: row.practiceCompleted,
          };
        }
      }

      const mod = pageContext.moduleId
        ? modules.find((m) => m.id === pageContext.moduleId)
        : undefined;
      if (mod) pageContext.moduleOrder = mod.orderNumber;
    }
  }

  const recentTopics: TutorTopic[] = [];
  for (const h of history.filter((x) => x.role === "user").slice(-4)) {
    recentTopics.push(classifyTutorTopic(h.content, pageContext));
  }

  const base: LearnerMemorySnapshot = {
    completedModules,
    totalActiveModules,
    currentModuleProgress,
    recentTopics,
    difficulty: "intermediate",
    conversationSummary: summarizeConversation(history),
  };

  base.difficulty = resolveTutorDifficulty(base, pageContext, history.length);
  return base;
}

export function formatMemoryBlock(memory: LearnerMemorySnapshot): string {
  const parts = [
    "### Память о прогрессе (без персональных данных)",
    `Завершено модулей: ${memory.completedModules} из ${memory.totalActiveModules || "?"}`,
    `Рекомендуемая сложность объяснения: ${memory.difficulty}`,
  ];

  const p = memory.currentModuleProgress;
  if (p) {
    parts.push(
      `Текущий модуль: лекция ${p.lessonDone ? "✓" : "—"}, видео ${p.videoDone ? "✓" : "—"}, тест ${p.testDone ? "✓" : "—"}, практика ${p.practiceDone ? "✓" : "—"}`,
    );
  }

  if (memory.recentTopics.length) {
    parts.push(`Недавние темы в чате: ${[...new Set(memory.recentTopics)].join(", ")}`);
  }

  parts.push("", "### Краткое резюме диалога", memory.conversationSummary);
  return parts.join("\n");
}
