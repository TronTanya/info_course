import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { persistPracticeSubmission, resolveInlineApiPracticeSave } from "@/lib/practice-progress-engine";
import { guardPracticeSubmission } from "@/lib/practice-submit-guard";
import { checkPracticeTaskSubmitBlocked } from "@/lib/course-progress-guards";
import { scoreLogAnalysisMiniSoc } from "@/lib/log-analysis-mini-soc-score";
import { consumeRateLimit } from "@/lib/rate-limit";
import { clientIpFromRequest } from "@/lib/request-ip";
import { securityLog } from "@/lib/security-log";

function revalidatePractice(moduleId: string) {
  revalidatePath(`/dashboard/course/${moduleId}/practice`);
  revalidatePath(`/dashboard/course/${moduleId}`);
  revalidatePath("/dashboard/course");
}

export type LogAnalysisCheckResponseBody = {
  score: number;
  maxScore: number;
  passed: boolean;
  feedback: string;
  saved?: boolean;
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  }

  const ip = clientIpFromRequest(req);
  if (
    !consumeRateLimit(`practice:log-analysis:ip:${ip}`, 80, 60 * 60 * 1000) ||
    !consumeRateLimit(`practice:log-analysis:user:${session.user.id}`, 40, 60 * 60 * 1000)
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
  const incidentType = typeof body.incidentType === "string" ? body.incidentType.trim() : "";
  const conclusion = typeof body.conclusion === "string" ? body.conclusion : "";

  const result = scoreLogAnalysisMiniSoc({ incidentType, conclusion });

  if (!moduleId || !practicalTaskId) {
    securityLog("practice.log_analysis.check", { userId: session.user.id, channel: "score_only", score: result.score });
    return NextResponse.json({
      score: result.score,
      maxScore: result.maxScore,
      passed: result.passed,
      feedback: result.feedback,
      saved: false,
    } satisfies LogAnalysisCheckResponseBody);
  }

  const g = await guardPracticeSubmission(session.user.id, moduleId, practicalTaskId, ["LOG_ANALYSIS"]);
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
      saved: false,
    } satisfies LogAnalysisCheckResponseBody);
  }

  const task = await prisma.practicalTask.findFirst({
    where: { id: practicalTaskId, moduleId },
    select: { id: true, taskType: true, maxScore: true, checkType: true },
  });
  if (!task || task.taskType !== "LOG_ANALYSIS") {
    return NextResponse.json({ error: "Задание не найдено или не относится к анализу журнала." }, { status: 400 });
  }

  let saved = false;
  const fullPass = result.passed;
  const points = fullPass ? Math.max(1, Math.round((task.maxScore * result.score) / result.maxScore)) : 0;
  const savePlan = resolveInlineApiPracticeSave(task.checkType, fullPass, points);
  if (savePlan.save) {
    await persistPracticeSubmission({
      userId: session.user.id,
      moduleId,
      practicalTaskId,
      textAnswer: JSON.stringify({
        kind: "log_analysis_mini_soc",
        incidentType,
        conclusion: conclusion.trim().slice(0, 8000),
        score: result.score,
        maxScore: result.maxScore,
      }).slice(0, 8000),
      status: savePlan.status,
      score: savePlan.score,
    });
    revalidatePractice(moduleId);
    saved = true;
    securityLog("practice.log_analysis.check", {
      userId: session.user.id,
      practicalTaskId,
      score: result.score,
      channel: savePlan.status === "ACCEPTED" ? "accepted" : "submitted_review",
    });
  } else {
    securityLog("practice.log_analysis.check", {
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
    saved,
  } satisfies LogAnalysisCheckResponseBody);
}
