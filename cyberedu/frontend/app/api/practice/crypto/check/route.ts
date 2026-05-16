import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { persistPracticeSubmission, resolveInlineApiPracticeSave } from "@/lib/practice-progress-engine";
import { guardPracticeSubmission } from "@/lib/practice-submit-guard";
import { checkPracticeTaskSubmitBlocked } from "@/lib/course-progress-guards";
import { scoreCryptoBeginner } from "@/lib/crypto-beginner-score";
import { consumeRateLimit } from "@/lib/rate-limit";
import { clientIpFromRequest } from "@/lib/request-ip";
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

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  }

  const ip = clientIpFromRequest(req);
  if (
    !consumeRateLimit(`practice:crypto:ip:${ip}`, 80, 60 * 60 * 1000) ||
    !consumeRateLimit(`practice:crypto:user:${session.user.id}`, 40, 60 * 60 * 1000)
  ) {
    return NextResponse.json({ error: "Слишком много проверок. Подождите и попробуйте снова." }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON." }, { status: 400 });
  }

  if (!json || typeof json !== "object" || Array.isArray(json)) {
    return NextResponse.json({ error: "Некорректное тело запроса." }, { status: 400 });
  }

  const body = json as Record<string, unknown>;
  const moduleId = typeof body.moduleId === "string" ? body.moduleId.trim() : "";
  const practicalTaskId = typeof body.practicalTaskId === "string" ? body.practicalTaskId.trim() : "";
  const caesar = typeof body.caesar === "string" ? body.caesar : "";
  const b64 = typeof body.b64 === "string" ? body.b64 : "";
  const hashMeaning = typeof body.hashMeaning === "string" ? body.hashMeaning : "";
  const hashSameRaw = body.hashSame;
  const hashSame: boolean | null =
    hashSameRaw === true ? true : hashSameRaw === false ? false : null;

  const result = scoreCryptoBeginner({ caesar, b64, hashSame, hashMeaning });

  if (!moduleId || !practicalTaskId) {
    securityLog("practice.crypto.check", { userId: session.user.id, channel: "score_only", score: result.score });
    return NextResponse.json({
      score: result.score,
      maxScore: result.maxScore,
      passed: result.passed,
      feedback: result.feedback,
      explanations: result.explanations,
      saved: false,
    } satisfies CryptoCheckResponseBody);
  }

  const g = await guardPracticeSubmission(session.user.id, moduleId, practicalTaskId, ["CRYPTO_TASK"]);
  if (!g.ok) {
    return NextResponse.json({ error: g.message }, { status: g.status });
  }

  const blocked = await checkPracticeTaskSubmitBlocked(session.user.id, practicalTaskId);
  if (blocked) {
    return NextResponse.json({ error: blocked }, { status: 403 });
  }

  const existingAccepted = await prisma.submission.findFirst({
    where: { userId: session.user.id, practicalTaskId, status: "ACCEPTED" },
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
      userId: session.user.id,
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
      userId: session.user.id,
      practicalTaskId,
      score: result.score,
      channel: savePlan.status === "ACCEPTED" ? "accepted" : "submitted_review",
    });
  } else {
    securityLog("practice.crypto.check", {
      userId: session.user.id,
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
}
