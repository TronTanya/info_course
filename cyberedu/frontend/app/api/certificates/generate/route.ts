import { NextResponse } from "next/server";
import { z } from "zod";
import { issueCertificate, getCertificateByUser, canGenerateCertificate } from "@/lib/certificate";
import { prisma } from "@/lib/db";
import { withAuthApiRoute } from "@/lib/security/api-guard";

const bodySchema = z.object({
  courseId: z.string().min(1).optional(),
});

export const POST = withAuthApiRoute(
  { rateLimit: "certGenerate", bodySchema },
  async ({ userId, body }) => {
    let courseId = body.courseId?.trim();

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

    const existing = await getCertificateByUser(userId, courseId);
    if (existing) {
      return NextResponse.json({ error: "Сертификат уже выдан." }, { status: 409 });
    }

    if (!(await canGenerateCertificate(userId, courseId))) {
      return NextResponse.json({ error: "Курс не завершён: пройдите все модули." }, { status: 403 });
    }

    const cert = await issueCertificate(userId, courseId);
    return NextResponse.json({
      certificateId: cert.id,
      certificateNumber: cert.certificateNumber,
      verificationCode: cert.verificationCode,
      pdfUrl: cert.pdfUrl,
      issuedAt: cert.issuedAt.toISOString(),
    });
  },
);
