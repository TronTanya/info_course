import { randomBytes } from "node:crypto";
import { createElement } from "react";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import type { CertificatePdfPayload } from "@/lib/certificate-pdf";
import { reconcileUserAchievements } from "@/lib/achievements";
import { getStorageService, namespaceDir } from "@/lib/storage";
import { SECURITY_ACTIONS } from "@/lib/security/audit-actions";
import { logSecurityEvent } from "@/lib/security/audit";

const CERT_NS = "certificates" as const;

export function certificateUploadDir(): string {
  return namespaceDir(CERT_NS);
}

export function certificateFileKey(certificateId: string): string {
  return `${certificateId}.pdf`;
}

export function certificateDiskPath(certificateId: string): string {
  return getStorageService().objectPath(CERT_NS, certificateFileKey(certificateId));
}

export async function ensureCertificateUploadDir(): Promise<void> {
  await getStorageService().ensureNamespace(CERT_NS);
}

export function publicAppBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "http://localhost:3100";
}

export function certificateVerifyUrl(verificationCode: string): string {
  return `${publicAppBaseUrl()}/certificate/verify/${encodeURIComponent(verificationCode)}`;
}

async function getPrimaryCourseId(): Promise<string | null> {
  const c = await prisma.course.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return c?.id ?? null;
}

/** Активные модули основного курса (первый курс в БД) и прогресс пользователя. */
async function getActiveCourseModuleContext(userId: string, courseId: string) {
  const modules = await prisma.module.findMany({
    where: { courseId, isActive: true },
    orderBy: { orderNumber: "asc" },
    select: { id: true, title: true },
  });
  const moduleIds = modules.map((m) => m.id);
  const progressRows =
    moduleIds.length > 0
      ? await prisma.progress.findMany({
          where: { userId, moduleId: { in: moduleIds } },
          select: {
            moduleId: true,
            moduleCompleted: true,
            score: true,
            createdAt: true,
            updatedAt: true,
          },
        })
      : [];
  const byModule = new Map(progressRows.map((p) => [p.moduleId, p]));
  return { modules, byModule };
}

/**
 * Можно выдать сертификат только если завершены все активные модули курса.
 */
export async function canGenerateCertificate(userId: string, courseId: string): Promise<boolean> {
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
  if (!course) return false;
  const { modules, byModule } = await getActiveCourseModuleContext(userId, courseId);
  if (modules.length === 0) return false;
  for (const m of modules) {
    const p = byModule.get(m.id);
    if (!p?.moduleCompleted) return false;
  }
  return true;
}

function randomAlphanumSegment(length: number): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i]! % alphabet.length]!;
  }
  return out;
}

/** Уникальный номер записи в реестре (с проверкой в БД). */
export async function generateCertificateNumber(): Promise<string> {
  const year = new Date().getFullYear();
  for (let i = 0; i < 32; i++) {
    const candidate = `CE-${year}-${randomAlphanumSegment(8)}`;
    const hit = await prisma.certificate.findUnique({
      where: { certificateNumber: candidate },
      select: { id: true },
    });
    if (!hit) return candidate;
  }
  throw new Error("Не удалось сгенерировать уникальный номер сертификата.");
}

/** Уникальный код проверки (с проверкой в БД). */
export async function generateVerificationCode(): Promise<string> {
  for (let i = 0; i < 32; i++) {
    const candidate = randomBytes(18).toString("hex");
    const hit = await prisma.certificate.findUnique({
      where: { verificationCode: candidate },
      select: { id: true },
    });
    if (!hit) return candidate;
  }
  throw new Error("Не удалось сгенерировать уникальный код проверки.");
}

export async function getCertificateByUser(userId: string, courseId: string) {
  return prisma.certificate.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
}

export type CertificateDashboardState = {
  courseId: string;
  courseTitle: string;
  courseHours: number;
  progressPercent: number;
  completedModules: number;
  totalModules: number;
  incompleteModules: { id: string; title: string }[];
  courseCompleted: boolean;
  certificate: null | {
    id: string;
    certificateNumber: string;
    issuedAt: string;
    verificationCode: string;
    verifyUrl: string;
  };
};

export async function getCertificateDashboardState(userId: string): Promise<CertificateDashboardState | null> {
  const courseId = await getPrimaryCourseId();
  if (!courseId) return null;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, hours: true },
  });
  if (!course) return null;

  const { modules, byModule } = await getActiveCourseModuleContext(userId, courseId);
  const incompleteModules: { id: string; title: string }[] = [];
  let completed = 0;
  for (const m of modules) {
    const p = byModule.get(m.id);
    if (p?.moduleCompleted) completed++;
    else incompleteModules.push({ id: m.id, title: m.title });
  }
  const total = modules.length;
  const progressPercent = total ? Math.round((completed / total) * 100) : 0;
  const courseCompleted = total > 0 && completed === total;

  const cert = await getCertificateByUser(userId, courseId);
  const verifyUrl = cert ? certificateVerifyUrl(cert.verificationCode) : "";

  return {
    courseId: course.id,
    courseTitle: course.title,
    courseHours: course.hours,
    progressPercent,
    completedModules: completed,
    totalModules: total,
    incompleteModules,
    courseCompleted,
    certificate: cert
      ? {
          id: cert.id,
          certificateNumber: cert.certificateNumber,
          issuedAt: cert.issuedAt.toISOString(),
          verificationCode: cert.verificationCode,
          verifyUrl,
        }
      : null,
  };
}

async function buildPdfPayloadForCertificate(
  userId: string,
  courseId: string,
  cert: { certificateNumber: string; verificationCode: string; issuedAt: Date },
): Promise<CertificatePdfPayload> {
  const [profile, course, { modules, byModule }] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId },
      select: { lastName: true, firstName: true, middleName: true },
    }),
    prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true, hours: true, createdAt: true },
    }),
    getActiveCourseModuleContext(userId, courseId),
  ]);

  if (!course) {
    throw new Error("COURSE_NOT_FOUND");
  }

  const fullName = profile
    ? [profile.lastName, profile.firstName, profile.middleName].filter(Boolean).join(" ")
    : "Участник";

  let totalScore = 0;
  const progressDates: { createdAt: Date; updatedAt: Date; completed: boolean }[] = [];
  for (const m of modules) {
    const p = byModule.get(m.id);
    totalScore += p?.score ?? 0;
    if (p) {
      progressDates.push({
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        completed: Boolean(p.moduleCompleted),
      });
    }
  }

  const completedRows = progressDates.filter((r) => r.completed);
  const courseCompletedAt =
    completedRows.length > 0
      ? new Date(Math.max(...completedRows.map((r) => r.updatedAt.getTime())))
      : cert.issuedAt;

  const anyProgress = progressDates.length > 0;
  const courseStartedAt = anyProgress
    ? new Date(Math.min(...progressDates.map((r) => r.createdAt.getTime())))
    : course.createdAt;

  const verifyUrl = certificateVerifyUrl(cert.verificationCode);
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 200,
    color: { dark: "#0f172a", light: "#ffffff" },
  });

  const organizationLine = process.env.CERTIFICATE_ORG_LINE?.trim() || "CyberEdu Academy";
  const signatoryLine =
    process.env.CERTIFICATE_SIGNATORY_LINE?.trim() || "Руководитель образовательной платформы";

  return {
    fullName,
    courseTitle: course.title,
    courseHours: course.hours,
    courseStartedAt,
    courseCompletedAt,
    totalScore,
    certificateNumber: cert.certificateNumber,
    verificationCode: cert.verificationCode,
    verifyUrl,
    issuedAt: cert.issuedAt,
    organizationLine,
    signatoryLine,
    qrDataUrl,
  };
}

export async function renderCertificatePdfToBuffer(payload: CertificatePdfPayload): Promise<Buffer> {
  const [{ renderToBuffer }, { CertificatePdfDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/lib/certificate-pdf"),
  ]);
  return renderToBuffer(
    // Корень — <Document> внутри CertificatePdfDocument; типы react-pdf ожидают именно DocumentProps.
    createElement(CertificatePdfDocument, payload) as Parameters<typeof renderToBuffer>[0],
  );
}

/**
 * Собирает актуальные данные из БД и возвращает PDF по существующей записи сертификата.
 */
export async function generateCertificatePdf(userId: string, courseId: string): Promise<Buffer> {
  const cert = await getCertificateByUser(userId, courseId);
  if (!cert) {
    throw new Error("CERTIFICATE_NOT_FOUND");
  }
  const payload = await buildPdfPayloadForCertificate(userId, courseId, cert);
  return renderCertificatePdfToBuffer(payload);
}

export async function writeCertificatePdfFile(certificateId: string, buffer: Buffer): Promise<void> {
  await getStorageService().write(CERT_NS, certificateFileKey(certificateId), buffer);
}

export async function readCertificatePdfFile(certificateId: string): Promise<Buffer | null> {
  return getStorageService().read(CERT_NS, certificateFileKey(certificateId));
}

/**
 * Создаёт запись сертификата, генерирует PDF и сохраняет файл на диск.
 * Требует: курс полностью пройден, записи ещё нет.
 */
export async function issueCertificate(userId: string, courseId: string) {
  if (!(await canGenerateCertificate(userId, courseId))) {
    throw new Error("NOT_ELIGIBLE");
  }
  const existing = await getCertificateByUser(userId, courseId);
  if (existing) {
    throw new Error("ALREADY_EXISTS");
  }

  const certificateNumber = await generateCertificateNumber();
  const verificationCode = await generateVerificationCode();

  const cert = await prisma.certificate.create({
    data: {
      userId,
      courseId,
      certificateNumber,
      verificationCode,
    },
  });

  try {
    const payload = await buildPdfPayloadForCertificate(userId, courseId, {
      certificateNumber: cert.certificateNumber,
      verificationCode: cert.verificationCode,
      issuedAt: cert.issuedAt,
    });
    const buffer = await renderCertificatePdfToBuffer(payload);
    await writeCertificatePdfFile(cert.id, buffer);
    const pdfUrl = `/api/certificates/download/${cert.id}`;
    await prisma.certificate.update({
      where: { id: cert.id },
      data: { pdfUrl },
    });
    const issued = await prisma.certificate.findUniqueOrThrow({ where: { id: cert.id } });
    logSecurityEvent({
      userId,
      action: SECURITY_ACTIONS.CERTIFICATE_GENERATE,
      targetId: issued.id,
      metadata: { courseId },
    });
    await reconcileUserAchievements(userId);
    return issued;
  } catch (e) {
    await prisma.certificate.delete({ where: { id: cert.id } }).catch(() => {});
    throw e;
  }
}
