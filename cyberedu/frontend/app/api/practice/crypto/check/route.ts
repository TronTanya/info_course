import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { PRACTICE_API_GUARD } from "@/lib/api/guard-presets";
import { prisma } from "@/lib/db";
import { persistPracticeSubmission, resolveInlineApiPracticeSave } from "@/lib/practice-progress-engine";
import { guardPracticeSubmission } from "@/lib/practice-submit-guard";
import { checkPracticeTaskSubmitBlocked } from "@/lib/course-progress-guards";
import { scoreCryptoBeginner } from "@/lib/crypto-beginner-score";
import { withApiGuard } from "@/lib/security/api-guard";
import { securityLog } from "@/lib/security-log";

function revalidatePractice(moduleId: string) {
  revalidatePath(`/dashboard/course/${moduleId}/practice`);
  revalidatePath(`/dashboard/course/${moduleId}`);
  revalidatePath("/dashboard/course");
}

export type CryptoCheckResponseBody = {
  score: number;
  maxScore: number;
  passed: boolean;
  feedback: string;
  explanations?: {
    caesar: string;
    base64: string;
    hash: string;
  };
  saved?: boolean;
};

const bodySchema = z.object({
  moduleId: z.string().optional(),
  practicalTaskId: z.string().optional(),
  caesar: z.string().optional(),
  b64: z.string().optional(),
  hashMeaning: z.string().optional(),
  hashSame: z.boolean().nullable().optional(),
});

export const POST = withApiGuard(
  { ...PRACTICE_API_GUARD, bodySchema },
  async ({ userId, body }) => {
  const moduleId = body.moduleId?.trim() ?? "";
  const practicalTaskId = body.practicalTaskId?.trim() ?? "";
  const caesar = body.caesar ?? "";
  const b64 = body.b64 ?? "";
  const hashMeaning = body.hashMeaning ?? "";
  const hashSame: boolean | null =
    body.hashSame === true ? true : body.hashSame === false ? false : null;

  const result = scoreCryptoBeginner({ caesar, b64, hashSame, hashMeaning });

  if (!moduleId || !practicalTaskId) {
    securityLog("practice.crypto.check", { userId: userId, channel: "score_only", score: result.score });
    return NextResponse.json({
      score: result.score,
      maxScore: result.maxScore,
      passed: result.passed,
      feedback: result.feedback,
      explanations: result.explanations,
      saved: false,
    } satisfies CryptoCheckResponseBody);
  }

  const g = await guardPracticeSubmission(userId, moduleId, practicalTaskId, ["CRYPTO_TASK"]);
  if (!g.ok) {
    return NextResponse.json({ error: g.message }, { status: g.status });
  }

  const blocked = await checkPracticeTaskSubmitBlocked(userId, practicalTaskId);
  if (blocked) {
    return NextResponse.json({ error: blocked }, { status: 403 });
  }

  const existingAccepted = await prisma.submission.findFirst({
    where: { userId: userId, practicalTaskId, status: "ACCEPTED" },
    select: { id: true },
  });
  if (existingAccepted) {
    return NextResponse.json({
      score: result.score,
      maxScore: result.maxScore,
      passed: true,
      feedback: "Задание уже принято ранее.",
      explanations: result.explanations,
      saved: false,
    } satisfies CryptoCheckResponseBody);
  }

  const task = await prisma.practicalTask.findFirst({
    where: { id: practicalTaskId, moduleId },
    select: { id: true, taskType: true, maxScore: true, checkType: true },
  });
  if (!task || task.taskType !== "CRYPTO_TASK") {
    return NextResponse.json({ error: "Задание не найдено или не относится к криптографии." }, { status: 400 });
  }

  let saved = false;
  const fullPass = result.score === result.maxScore;
  const points = fullPass ? Math.max(1, Math.round((task.maxScore * result.score) / result.maxScore)) : 0;
  const savePlan = resolveInlineApiPracticeSave(task.checkType, fullPass, points);
  if (savePlan.save) {
    await persistPracticeSubmission({
      userId: userId,
      moduleId,
      practicalTaskId,
      textAnswer: JSON.stringify({
        kind: "crypto_beginner_task",
        caesar: caesar.trim().slice(0, 500),
        b64: b64.trim().slice(0, 500),
        hashSame,
        hashMeaning: hashMeaning.trim().slice(0, 4000),
        score: result.score,
        maxScore: result.maxScore,
      }).slice(0, 8000),
      status: savePlan.status,
      score: savePlan.score,
    });
    revalidatePractice(moduleId);
    saved = true;
    securityLog("practice.crypto.check", {
      userId: userId,
      practicalTaskId,
      score: result.score,
      channel: savePlan.status === "ACCEPTED" ? "accepted" : "submitted_review",
    });
  } else {
    securityLog("practice.crypto.check", {
      userId: userId,
      practicalTaskId,
      score: result.score,
      channel: "feedback_only",
    });
  }

  return NextResponse.json({
    score: result.score,
    maxScore: result.maxScore,
    passed: result.passed,
    feedback: result.feedback,
    explanations: result.explanations,
    saved,
  } satisfies CryptoCheckResponseBody);
  },
);
