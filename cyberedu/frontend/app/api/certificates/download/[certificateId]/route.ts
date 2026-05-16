import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateCertificatePdf, readCertificatePdfFile, writeCertificatePdfFile } from "@/lib/certificate";
import { prisma } from "@/lib/db";

function safeFilenamePart(s: string): string {
  return s.replace(/[^\w\u0400-\u04FF.-]+/g, "_").slice(0, 80);
}

export async function GET(_req: Request, ctx: { params: Promise<{ certificateId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Доступ запрещён.", { status: 403 });
  }

  const { certificateId } = await ctx.params;
  if (!certificateId?.trim()) {
    return new NextResponse("Не найдено.", { status: 404 });
  }

  const isAdmin = session.user.role === "ADMIN";
  const cert = await prisma.certificate.findFirst({
    where: isAdmin ? { id: certificateId } : { id: certificateId, userId: session.user.id },
    select: { id: true, userId: true, courseId: true, certificateNumber: true },
  });
  if (!cert) {
    return new NextResponse("Не найдено.", { status: 404 });
  }

  let buf = await readCertificatePdfFile(cert.id);
  if (!buf) {
    try {
      buf = await generateCertificatePdf(cert.userId, cert.courseId);
      await writeCertificatePdfFile(cert.id, buf);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[certificates/download] PDF regenerate failed:", msg, e);
      return new NextResponse(
        process.env.NODE_ENV === "development"
          ? `Файл сертификата недоступен. (${msg})`
          : "Файл сертификата недоступен. Пересоберите образ frontend (шрифты PDF) или обратитесь к администратору.",
        { status: 500 },
      );
    }
  }

  const name = safeFilenamePart(`certificate-${cert.certificateNumber}`);

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${name}.pdf"`,
    },
  });
}
