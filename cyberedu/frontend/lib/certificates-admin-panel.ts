import { eligibleUserIdsWithoutCertificate } from "@/lib/admin-certificate-eligible";
import { assertAdminDataAccess } from "@/lib/admin-access";
import { certificateVerifyUrl } from "@/lib/certificate";
import { certificateRecordStatus, certificateSupportsRevoke } from "@/lib/certificate-registry";
import {
  CERTIFICATES_ADMIN_REGISTRY_PATH,
  certificateRegistryStatus,
  type CertificatesAdminEligibleCandidate,
  type CertificatesAdminPanelData,
  type CertificatesAdminPanelItem,
  studentAdminHref,
} from "@/lib/certificates-admin-panel-logic";
import { prisma } from "@/lib/db";

export type { CertificatesAdminPanelData } from "@/lib/certificates-admin-panel-logic";

function formatStudentLabel(
  email: string,
  profile: { lastName: string; firstName: string; middleName: string | null } | null,
): string {
  if (!profile) return email;
  const mid = profile.middleName ? ` ${profile.middleName}` : "";
  const fio = `${profile.lastName} ${profile.firstName}${mid}`.trim();
  return fio || email;
}

async function loadEligibleCandidates(courseId: string, moduleIds: string[], limit: number) {
  const withoutCert = (await eligibleUserIdsWithoutCertificate(courseId, moduleIds)).slice(0, limit);
  if (withoutCert.length === 0) return [];

  const users = await prisma.user.findMany({
    where: { id: { in: withoutCert } },
    select: {
      id: true,
      email: true,
      profile: { select: { lastName: true, firstName: true, middleName: true } },
    },
  });

  return users.map(
    (u): CertificatesAdminEligibleCandidate => ({
      userId: u.id,
      studentLabel: formatStudentLabel(u.email, u.profile),
      courseId,
    }),
  );
}

export async function getCertificatesAdminPanelData(): Promise<CertificatesAdminPanelData> {
  await assertAdminDataAccess();

  const course = await prisma.course.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true, title: true },
  });

  const [issuedTotal, recentRows, modules] = await Promise.all([
    prisma.certificate.count(),
    prisma.certificate.findMany({
      orderBy: { issuedAt: "desc" },
      take: 6,
      select: {
        id: true,
        certificateNumber: true,
        verificationCode: true,
        issuedAt: true,
        pdfUrl: true,
        revokedAt: true,
        userId: true,
        course: { select: { title: true } },
        user: {
          select: {
            email: true,
            profile: { select: { lastName: true, firstName: true, middleName: true } },
          },
        },
      },
    }),
    course
      ? prisma.module.findMany({
          where: { courseId: course.id, isActive: true },
          select: { id: true },
        })
      : Promise.resolve([]),
  ]);

  const moduleIds = modules.map((m) => m.id);
  const eligibleIds =
    course ? await eligibleUserIdsWithoutCertificate(course.id, moduleIds) : [];
  const eligibleCount = eligibleIds.length;
  const eligibleCandidates =
    course && eligibleCount > 0 ? await loadEligibleCandidates(course.id, moduleIds, 5) : [];

  const recent: CertificatesAdminPanelItem[] = recentRows.map((c) => ({
    id: c.id,
    certificateNumber: c.certificateNumber,
    studentLabel: formatStudentLabel(c.user.email, c.user.profile),
    studentHref: studentAdminHref(c.userId),
    courseTitle: c.course.title,
    issuedAt: c.issuedAt.toISOString(),
    verifyHref: certificateVerifyUrl(c.certificateNumber),
    status: certificateRegistryStatus(true, certificateRecordStatus(c) === "revoked"),
    hasPdf: Boolean(c.pdfUrl),
  }));

  const verifyCtaHref = recent[0]?.verifyHref ?? CERTIFICATES_ADMIN_REGISTRY_PATH;

  return {
    issuedTotal,
    eligibleCount,
    issueSupported: true,
    supportsRevoke: certificateSupportsRevoke(),
    registryHref: CERTIFICATES_ADMIN_REGISTRY_PATH,
    verifyCtaHref,
    recent,
    eligibleCandidates,
  };
}

