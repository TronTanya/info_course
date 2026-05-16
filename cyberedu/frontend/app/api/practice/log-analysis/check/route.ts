import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { PRACTICE_API_GUARD } from "@/lib/api/guard-presets";
import { prisma } from "@/lib/db";
import { persistPracticeSubmission, resolveInlineApiPracticeSave } from "@/lib/practice-progress-engine";
import { guardPracticeSubmission } from "@/lib/practice-submit-guard";
import { checkPracticeTaskSubmitBlocked } from "@/lib/course-progress-guards";
import { scoreLogAnalysisMiniSoc } from "@/lib/log-analysis-mini-soc-score";
import { withApiGuard } from "@/lib/security/api-guard";
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

const bodySchema = z.object({
  moduleId: z.string().optional(),
  practicalTaskId: z.string().optional(),
  incidentType: z.string().optional(),
  conclusion: z.string().optional(),
});

export const POST = withApiGuard(
  { ...PRACTICE_API_GUARD, bodySchema },
  async ({ userId, body }) => {
  const moduleId = body.moduleId?.trim() ?? "";
  const practicalTaskId = body.practicalTaskId?.trim() ?? "";
  const incidentType = body.incidentType?.trim() ?? "";
  const conclusion = body.conclusion ?? "";

  const result = scoreLogAnalysisMiniSoc({ incidentType, conclusion });

  if (!moduleId || !practicalTaskId) {
    securityLog("practice.log_analysis.check", { userId: userId, channel: "score_only", score: result.score });
    return NextResponse.json({
      score: result.score,
      maxScore: result.maxScore,
      passed: result.passed,
      feedback: result.feedback,
      saved: false,
    } satisfies LogAnalysisCheckResponseBody);
  }

  const g = await guardPracticeSubmission(userId, moduleId, practicalTaskId, ["LOG_ANALYSIS"]);
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
      userId: userId,
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
      userId: userId,
      practicalTaskId,
      score: result.score,
      channel: savePlan.status === "ACCEPTED" ? "accepted" : "submitted_review",
    });
  } else {
    securityLog("practice.log_analysis.check", {
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
    saved,
  } satisfies LogAnalysisCheckResponseBody);
  },
);
