import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { persistPracticeSubmission, resolveInlineApiPracticeSave } from "@/lib/practice-progress-engine";
import { guardPracticeSubmission } from "@/lib/practice-submit-guard";
import { checkPracticeTaskSubmitBlocked } from "@/lib/course-progress-guards";
import { scoreUrlAnalysis, URL_ANALYSIS_ITEMS, type UrlAnalysisRowInput } from "@/lib/url-analysis-score";
import { consumeRateLimit } from "@/lib/rate-limit";
import { clientIpFromRequest } from "@/lib/request-ip";
import { securityLog } from "@/lib/security-log";

function revalidatePractice(moduleId: string) {
  revalidatePath(`/dashboard/course/${moduleId}/practice`);
  revalidatePath(`/dashboard/course/${moduleId}`);
  revalidatePath("/dashboard/course");
}

export type UrlAnalysisCheckResponseBody = {
  score: number;
  maxScore: number;
  passed: boolean;
  feedback: string;
  saved?: boolean;
};

function parseRows(raw: unknown): UrlAnalysisRowInput[] | null {
  if (!Array.isArray(raw)) return null;
  const out: UrlAnalysisRowInput[] = [];
  for (const x of raw.slice(0, 32)) {
    if (!x || typeof x !== "object" || Array.isArray(x)) continue;
    const o = x as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id.trim() : "";
    const verdict = typeof o.verdict === "string" ? o.verdict : "";
    const reason = o.reason == null ? null : typeof o.reason === "string" ? o.reason : null;
    if (id) out.push({ id, verdict, reason });
  }
  return out;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  }

  const ip = clientIpFromRequest(req);
  if (
    !consumeRateLimit(`practice:url-analysis:ip:${ip}`, 80, 60 * 60 * 1000) ||
    !consumeRateLimit(`practice:url-analysis:user:${session.user.id}`, 40, 60 * 60 * 1000)
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
  const explanation = typeof body.explanation === "string" ? body.explanation : "";
  const rows = parseRows(body.rows);

  if (!rows) {
    return NextResponse.json({ error: "Поле rows должно быть массивом объектов { id, verdict, reason? }." }, { status: 400 });
  }

  const ids = new Set(rows.map((r) => r.id));
  const need = URL_ANALYSIS_ITEMS.map((i) => i.id);
  if (need.some((id) => !ids.has(id)) || rows.length !== need.length || ids.size !== need.length) {
    return NextResponse.json({ error: "Нужно заполнить все учебные ссылки (u1–u5)." }, { status: 400 });
  }

  const result = scoreUrlAnalysis(rows, explanation);

  if (!moduleId || !practicalTaskId) {
    securityLog("practice.url_analysis.check", { userId: session.user.id, channel: "score_only", score: result.score });
    const out: UrlAnalysisCheckResponseBody = {
      score: result.score,
      maxScore: result.maxScore,
      passed: result.passed,
      feedback: result.feedback,
      saved: false,
    };
    return NextResponse.json(out);
  }

  const g = await guardPracticeSubmission(session.user.id, moduleId, practicalTaskId, ["URL_ANALYSIS"]);
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
    const out: UrlAnalysisCheckResponseBody = {
      score: result.score,
      maxScore: result.maxScore,
      passed: true,
      feedback: "Задание уже принято ранее.",
      saved: false,
    };
    return NextResponse.json(out);
  }

  const task = await prisma.practicalTask.findFirst({
    where: { id: practicalTaskId, moduleId },
    select: { id: true, taskType: true, maxScore: true, checkType: true },
  });
  if (!task || task.taskType !== "URL_ANALYSIS") {
    return NextResponse.json({ error: "Задание не найдено или не относится к анализу ссылок." }, { status: 400 });
  }

  let saved = false;
  const fullPass = result.explanationOk && result.score >= 9;
  const points = fullPass ? Math.max(1, Math.round((task.maxScore * result.score) / result.maxScore)) : 0;
  const savePlan = resolveInlineApiPracticeSave(task.checkType, fullPass, points);
  if (savePlan.save) {
    await persistPracticeSubmission({
      userId: session.user.id,
      moduleId,
      practicalTaskId,
      textAnswer: JSON.stringify({
        kind: "url_analysis_task",
        rows,
        explanation: explanation.trim().slice(0, 4000),
        score: result.score,
        maxScore: result.maxScore,
      }).slice(0, 8000),
      status: savePlan.status,
      score: savePlan.score,
    });
    revalidatePractice(moduleId);
    saved = true;
    securityLog("practice.url_analysis.check", {
      userId: session.user.id,
      practicalTaskId,
      score: result.score,
      channel: savePlan.status === "ACCEPTED" ? "accepted" : "submitted_review",
    });
  } else {
    securityLog("practice.url_analysis.check", {
      userId: session.user.id,
      practicalTaskId,
      score: result.score,
      channel: "feedback_only",
    });
  }

  const out: UrlAnalysisCheckResponseBody = {
    score: result.score,
    maxScore: result.maxScore,
    passed: result.passed,
    feedback: result.feedback,
    saved,
  };
  return NextResponse.json(out);
}
