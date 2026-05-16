import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { issueCertificate, getCertificateByUser, canGenerateCertificate } from "@/lib/certificate";
import { prisma } from "@/lib/db";
import { consumeRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Требуется вход в систему." }, { status: 401 });
  }

  if (!consumeRateLimit(`cert:generate:${session.user.id}`, 15, 24 * 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Слишком много запросов на генерацию. Попробуйте позже." }, { status: 429 });
  }

  let courseId: string | undefined;
  try {
    const body = await req.json().catch(() => ({}));
    if (body && typeof body.courseId === "string" && body.courseId.trim()) {
      courseId = body.courseId.trim();
    }
  } catch {
    courseId = undefined;
  }

  if (!courseId) {
    const first = await prisma.course.findFirst({
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    if (!first) {
      return NextResponse.json({ error: "Курс не настроен." }, { status: 404 });
    }
    courseId = first.id;
  } else {
    const exists = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
    if (!exists) {
      return NextResponse.json({ error: "Курс не найден." }, { status: 404 });
    }
  }

  const existing = await getCertificateByUser(session.user.id, courseId);
  if (existing) {
    return NextResponse.json({ error: "Сертификат уже выдан." }, { status: 409 });
  }

  if (!(await canGenerateCertificate(session.user.id, courseId))) {
    return NextResponse.json({ error: "Курс не завершён: пройдите все модули." }, { status: 403 });
  }

  try {
    const cert = await issueCertificate(session.user.id, courseId);
    return NextResponse.json({
      certificateId: cert.id,
      certificateNumber: cert.certificateNumber,
      verificationCode: cert.verificationCode,
      pdfUrl: cert.pdfUrl,
      issuedAt: cert.issuedAt.toISOString(),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Не удалось сформировать сертификат." }, { status: 500 });
  }
}
