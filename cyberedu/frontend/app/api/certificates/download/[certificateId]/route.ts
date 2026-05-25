import { NextResponse } from "next/server";
import { ensureCertificatePdfDownload } from "@/lib/certificate";
import { prisma } from "@/lib/db";
import { withAuthApiRoute } from "@/lib/security/api-guard";

function safeFilenamePart(s: string): string {
  return s.replace(/[^\w\u0400-\u04FF.-]+/g, "_").slice(0, 80);
}

type CertDownloadRouteCtx = { params: Promise<{ certificateId: string }> };

export const GET = withAuthApiRoute(
  { requireAuth: true },
  async ({ session, userId }, routeCtx: CertDownloadRouteCtx) => {
    const { certificateId } = await routeCtx.params;
    if (!certificateId?.trim()) {
      return new NextResponse("Не найдено.", { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const cert = await prisma.certificate.findFirst({
      where: isAdmin ? { id: certificateId } : { id: certificateId, userId },
      select: {
        id: true,
        userId: true,
        courseId: true,
        certificateNumber: true,
        revokedAt: true,
        pdfUrl: true,
      },
    });
    if (!cert) {
      return new NextResponse("Не найдено.", { status: 404 });
    }

    if (cert.revokedAt && !isAdmin) {
      return new NextResponse("Сертификат отозван.", { status: 403 });
    }

    let buf: Buffer;
    try {
      buf = await ensureCertificatePdfDownload(cert);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg === "PDF_FONTS_NOT_READY") {
        return new NextResponse(
          "PDF-скачивание будет доступно после настройки генерации.",
          { status: 503 },
        );
      }
      console.error("[certificates/download] PDF failed:", msg, e);
      return new NextResponse("Файл сертификата временно недоступен.", { status: 500 });
    }

    const name = safeFilenamePart(`certificate-${cert.certificateNumber}`);

    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${name}.pdf"`,
      },
    });
  },
);
