import { prisma } from "@/lib/db";

export type AdminCertificateRow = {
  id: string;
  certificateNumber: string;
  verificationCode: string;
  issuedAt: Date;
  pdfUrl: string | null;
  userEmail: string;
  fullName: string;
  courseTitle: string;
};

function fullNameFromProfile(p: {
  lastName: string | null;
  firstName: string | null;
  middleName: string | null;
} | null): string {
  if (!p) return "—";
  const parts = [p.lastName, p.firstName, p.middleName].filter(Boolean) as string[];
  const s = parts.join(" ").trim();
  return s || "—";
}

/** Список выданных сертификатов для админки (без PDF в теле ответа). */
export async function getAdminCertificateRows(): Promise<AdminCertificateRow[]> {
  const rows = await prisma.certificate.findMany({
    orderBy: { issuedAt: "desc" },
    take: 500,
    include: {
      user: {
        select: {
          email: true,
          profile: { select: { lastName: true, firstName: true, middleName: true } },
        },
      },
      course: { select: { title: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    certificateNumber: r.certificateNumber,
    verificationCode: r.verificationCode,
    issuedAt: r.issuedAt,
    pdfUrl: r.pdfUrl,
    userEmail: r.user.email,
    fullName: fullNameFromProfile(r.user.profile),
    courseTitle: r.course.title,
  }));
}
