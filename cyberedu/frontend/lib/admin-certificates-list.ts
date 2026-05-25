import { assertAdminDataAccess } from "@/lib/admin-access";
import { certificateVerifyUrl } from "@/lib/certificate";
import { certificateRecordStatus, type CertificateRecordStatus } from "@/lib/certificate-registry";
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
  userId: string;
  status: CertificateRecordStatus;
  verifyHref: string;
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
  await assertAdminDataAccess();
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
    userId: r.userId,
    status: certificateRecordStatus(r),
    verifyHref: certificateVerifyUrl(r.certificateNumber),
  }));
}
