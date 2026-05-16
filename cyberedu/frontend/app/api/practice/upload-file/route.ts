import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { UPLOAD_API_GUARD } from "@/lib/api/guard-presets";
import { prisma } from "@/lib/db";
import { recalculateAfterSubmission } from "@/lib/practice-access";
import { savePracticeFile, validatePracticeUpload } from "@/lib/practice-files";
import { practiceUploadLimitsFromTask } from "@/lib/practice-file-constants";
import { guardPracticeSubmission } from "@/lib/practice-submit-guard";
import { withApiGuard } from "@/lib/security/api-guard";
import { securityLog } from "@/lib/security-log";

function revalidatePractice(moduleId: string) {
  revalidatePath(`/dashboard/course/${moduleId}/practice`);
  revalidatePath(`/dashboard/course/${moduleId}`);
  revalidatePath("/dashboard/course");
}

export const POST = withApiGuard(UPLOAD_API_GUARD, async ({ userId, req }) => {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Некорректные данные формы." }, { status: 400 });
  }

  const moduleId = String(form.get("moduleId") ?? "").trim();
  const taskId = String(form.get("practicalTaskId") ?? "").trim();
  const file = form.get("file");

  if (!moduleId || !taskId) {
    return NextResponse.json({ error: "Укажите модуль и задание." }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Прикрепите файл." }, { status: 400 });
  }

  const g = await guardPracticeSubmission(userId, moduleId, taskId, ["FILE_UPLOAD"]);
  if (!g.ok) {
    return NextResponse.json({ error: g.message }, { status: g.status });
  }

  const task = await prisma.practicalTask.findFirst({
    where: { id: taskId, moduleId },
    select: { id: true, taskType: true, allowedFileTypes: true, maxFileSizeMb: true },
  });
  if (!task || task.taskType !== "FILE_UPLOAD") {
    return NextResponse.json({ error: "Задание не найдено или не предполагает загрузку файла." }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const limits = practiceUploadLimitsFromTask({
    allowedFileTypes: task.allowedFileTypes,
    maxFileSizeMb: task.maxFileSizeMb,
  });
  const validated = validatePracticeUpload(buf, file.name, limits);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const draft = await prisma.submission.create({
    data: {
      userId: g.userId,
      practicalTaskId: taskId,
      status: "DRAFT",
    },
  });

  try {
    await savePracticeFile(draft.id, validated.ext, buf);
  } catch (e) {
    console.error(e);
    await prisma.submission.delete({ where: { id: draft.id } }).catch(() => {});
    return NextResponse.json({ error: "Не удалось сохранить файл." }, { status: 500 });
  }

  const downloadPath = `/api/practice/download?id=${draft.id}`;
  await prisma.submission.update({
    where: { id: draft.id },
    data: { fileUrl: downloadPath, status: "SUBMITTED" },
  });

  await recalculateAfterSubmission(g.userId, moduleId);
  revalidatePractice(moduleId);

  securityLog("practice.file_upload", {
    userId: g.userId,
    practicalTaskId: taskId,
    submissionId: draft.id,
  });

  return NextResponse.json({ ok: true, submissionId: draft.id });
});
