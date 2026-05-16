import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { PRACTICE_API_GUARD } from "@/lib/api/guard-presets";
import { prisma } from "@/lib/db";
import { persistPracticeSubmission, resolveInlineApiPracticeSave } from "@/lib/practice-progress-engine";
import { guardPracticeSubmission } from "@/lib/practice-submit-guard";
import { checkPracticeTaskSubmitBlocked } from "@/lib/course-progress-guards";
import { scoreUrlAnalysis, URL_ANALYSIS_ITEMS, type UrlAnalysisRowInput } from "@/lib/url-analysis-score";
import { withApiGuard } from "@/lib/security/api-guard";
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

const bodySchema = z.object({
  moduleId: z.string().optional(),
  practicalTaskId: z.string().optional(),
  explanation: z.string().optional(),
  rows: z.unknown().optional(),
});

export const POST = withApiGuard(
  { ...PRACTICE_API_GUARD, bodySchema },
  async ({ userId, body }) => {
  const moduleId = body.moduleId?.trim() ?? "";
  const practicalTaskId = body.practicalTaskId?.trim() ?? "";
  const explanation = body.explanation ?? "";
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
    securityLog("practice.url_analysis.check", { userId: userId, channel: "score_only", score: result.score });
    const out: UrlAnalysisCheckResponseBody = {
      score: result.score,
      maxScore: result.maxScore,
      passed: result.passed,
      feedback: result.feedback,
      saved: false,
    };
    return NextResponse.json(out);
  }

  const g = await guardPracticeSubmission(userId, moduleId, practicalTaskId, ["URL_ANALYSIS"]);
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
      userId: userId,
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
      userId: userId,
      practicalTaskId,
      score: result.score,
      channel: savePlan.status === "ACCEPTED" ? "accepted" : "submitted_review",
    });
  } else {
    securityLog("practice.url_analysis.check", {
      userId: userId,
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
  },
);
