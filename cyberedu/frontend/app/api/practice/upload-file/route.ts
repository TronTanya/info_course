import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { recalculateAfterSubmission } from "@/lib/practice-access";
import { savePracticeFile, validatePracticeUpload } from "@/lib/practice-files";
import { practiceUploadLimitsFromTask } from "@/lib/practice-file-constants";
import { guardPracticeSubmission } from "@/lib/practice-submit-guard";
import { consumeRateLimit } from "@/lib/rate-limit";
import { clientIpFromRequest } from "@/lib/request-ip";
import { securityLog } from "@/lib/security-log";

function revalidatePractice(moduleId: string) {
  revalidatePath(`/dashboard/course/${moduleId}/practice`);
  revalidatePath(`/dashboard/course/${moduleId}`);
  revalidatePath("/dashboard/course");
}

export async function POST(req: Request) {
  const session = await auth();
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

  const g = await guardPracticeSubmission(session?.user?.id, moduleId, taskId, ["FILE_UPLOAD"]);
  if (!g.ok) {
    return NextResponse.json({ error: g.message }, { status: g.status });
  }

  const ip = clientIpFromRequest(req);
  if (
    !consumeRateLimit(`practice:upload:ip:${ip}`, 50, 60 * 60 * 1000) ||
    !consumeRateLimit(`practice:upload:user:${g.userId}`, 30, 60 * 60 * 1000)
  ) {
    return NextResponse.json({ error: "Слишком много загрузок файлов. Подождите час или попробуйте позже." }, { status: 429 });
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
}
