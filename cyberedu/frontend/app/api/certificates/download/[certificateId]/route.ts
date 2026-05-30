import { NextResponse } from "next/server";
import { generateCertificatePdf, readCertificatePdfFile, writeCertificatePdfFile } from "@/lib/certificate";
import { prisma } from "@/lib/db";
import { getDbUserRole } from "@/lib/permissions";
import { withAuthApiRoute } from "@/lib/security/api-guard";

function safeFilenamePart(s: string): string {
  return s.replace(/[^\w\u0400-\u04FF.-]+/g, "_").slice(0, 80);
}

type CertDownloadRouteCtx = { params: Promise<{ certificateId: string }> };

export const GET = withAuthApiRoute(
  { requireAuth: true },
  async ({ userId }, routeCtx: CertDownloadRouteCtx) => {
    const { certificateId } = await routeCtx.params;
    if (!certificateId?.trim()) {
      return new NextResponse("Не найдено.", { status: 404 });
    }

    const dbRole = await getDbUserRole(userId);
    const isAdmin = dbRole === "ADMIN";
    const cert = await prisma.certificate.findFirst({
      where: isAdmin ? { id: certificateId } : { id: certificateId, userId },
      select: { id: true, userId: true, courseId: true, certificateNumber: true },
    });
    if (!cert) {
      return new NextResponse("Не найдено.", { status: 404 });
    }

    let buf = await readCertificatePdfFile(cert.id);
    if (!buf) {
      try {
        buf = await generateCertificatePdf(cert.userId, cert.courseId);
        try {
          await writeCertificatePdfFile(cert.id, buf);
        } catch (writeErr) {
          console.warn("[certificates/download] PDF cache write failed:", writeErr);
        }
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
  },
);
