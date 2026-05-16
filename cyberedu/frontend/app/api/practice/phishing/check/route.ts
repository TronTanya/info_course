import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { PRACTICE_API_GUARD } from "@/lib/api/guard-presets";
import { prisma } from "@/lib/db";
import { persistPracticeSubmission, resolveInlineApiPracticeSave } from "@/lib/practice-progress-engine";
import { guardPracticeSubmission } from "@/lib/practice-submit-guard";
import { checkPracticeTaskSubmitBlocked } from "@/lib/course-progress-guards";
import { scorePhishingEmailSelection } from "@/lib/phishing-email-score";
import { withApiGuard } from "@/lib/security/api-guard";
import { securityLog } from "@/lib/security-log";

function revalidatePractice(moduleId: string) {
  revalidatePath(`/dashboard/course/${moduleId}/practice`);
  revalidatePath(`/dashboard/course/${moduleId}`);
  revalidatePath("/dashboard/course");
}

export type PhishingCheckResponseBody = {
  score: number;
  maxScore: number;
  passed: boolean;
  feedback: string;
  saved?: boolean;
};

const bodySchema = z.object({
  moduleId: z.string().optional(),
  practicalTaskId: z.string().optional(),
  selectedElements: z.array(z.string()).max(16).optional(),
});

export const POST = withApiGuard(
  { ...PRACTICE_API_GUARD, bodySchema },
  async ({ userId, body }) => {
  const moduleId = body.moduleId?.trim() ?? "";
  const practicalTaskId = body.practicalTaskId?.trim() ?? "";
  const rawSel = body.selectedElements;

  if (!Array.isArray(rawSel)) {
    return NextResponse.json({ error: "Поле selectedElements должно быть массивом." }, { status: 400 });
  }

  const selectedElements = rawSel
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 16);

  const result = scorePhishingEmailSelection(selectedElements);

  if (!moduleId || !practicalTaskId) {
    securityLog("practice.phishing.check", { userId, channel: "score_only", score: result.score });
    const out: PhishingCheckResponseBody = {
      score: result.score,
      maxScore: result.maxScore,
      passed: result.passed,
      feedback: result.feedback,
      saved: false,
    };
    return NextResponse.json(out);
  }

  const g = await guardPracticeSubmission(userId, moduleId, practicalTaskId, ["PHISHING_ANALYSIS"]);
  if (!g.ok) {
    return NextResponse.json({ error: g.message }, { status: g.status });
  }

  const blocked = await checkPracticeTaskSubmitBlocked(userId, practicalTaskId);
  if (blocked) {
    return NextResponse.json({ error: blocked }, { status: 403 });
  }

  const existingAccepted = await prisma.submission.findFirst({
    where: { userId, practicalTaskId, status: "ACCEPTED" },
    select: { id: true },
  });
  if (existingAccepted) {
    const out: PhishingCheckResponseBody = {
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
  if (!task || task.taskType !== "PHISHING_ANALYSIS") {
    return NextResponse.json({ error: "Задание не найдено или не относится к разбору фишинга." }, { status: 400 });
  }

  let saved = false;
  const gate = result.score >= 4;
  const points = gate ? Math.max(1, Math.round((task.maxScore * result.score) / result.maxScore)) : 0;
  const savePlan = resolveInlineApiPracticeSave(task.checkType, gate, points);
  if (savePlan.save) {
    await persistPracticeSubmission({
      userId,
      moduleId,
      practicalTaskId,
      textAnswer: JSON.stringify({
        kind: "phishing_email_task",
        selectedElements,
        score: result.score,
        maxScore: result.maxScore,
      }).slice(0, 8000),
      status: savePlan.status,
      score: savePlan.score,
    });
    revalidatePractice(moduleId);
    saved = true;
    securityLog("practice.phishing.check", {
      userId,
      practicalTaskId,
      score: result.score,
      channel: savePlan.status === "ACCEPTED" ? "accepted" : "submitted_review",
    });
  } else {
    securityLog("practice.phishing.check", {
      userId,
      practicalTaskId,
      score: result.score,
      channel: "feedback_only",
    });
  }

  const out: PhishingCheckResponseBody = {
    score: result.score,
    maxScore: result.maxScore,
    passed: result.passed,
    feedback: result.feedback,
    saved,
  };
  return NextResponse.json(out);
  },
);
