"use server";

import { revalidatePath } from "next/cache";
import {
  canGenerateCertificate,
  getCertificateByUser,
  issueCertificate,
  revokeCertificate,
} from "@/lib/certificate";
import {
  certificateSupportsRevoke,
  certificateSupportsRevokeReason,
  normalizeRevokeReason,
} from "@/lib/certificate-registry";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/permissions";
import { SECURITY_ACTIONS } from "@/lib/security/audit-actions";
import { logAdminSecurityEvent } from "@/lib/security/audit";

export type AdminIssueCertificateState = {
  error?: string;
  success?: boolean;
  certificateId?: string;
  certificateNumber?: string;
};

function parseIssueError(err: unknown): string {
  if (err instanceof Error) {
    if (err.message === "NOT_ELIGIBLE") {
      return "Студент не выполнил условия курса для выдачи сертификата.";
    }
    if (err.message === "ALREADY_EXISTS") {
      return "Сертификат для этого курса уже выдан.";
    }
  }
  return "Не удалось выдать сертификат. Повторите позже.";
}

export async function adminIssueCertificateAction(
  _prev: AdminIssueCertificateState | null,
  formData: FormData,
): Promise<AdminIssueCertificateState> {
  const session = await requireAdmin();

  const userId = String(formData.get("userId") ?? "").trim();
  const courseId = String(formData.get("courseId") ?? "").trim();

  if (!userId || !courseId) {
    return { error: "Укажите студента и курс." };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "USER") {
    return { error: "Выдача доступна только для учётной записи студента." };
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true },
  });
  if (!course) return { error: "Курс не найден." };

  const existing = await getCertificateByUser(userId, courseId);
  if (existing) {
    return { error: "Сертификат уже есть в реестре." };
  }

  if (!(await canGenerateCertificate(userId, courseId))) {
    return { error: "Условия курса для выдачи не выполнены." };
  }

  try {
    const cert = await issueCertificate(userId, courseId);

    logAdminSecurityEvent(
      session.user.id,
      SECURITY_ACTIONS.CERTIFICATE_GENERATE,
      cert.id,
      { studentUserId: userId, courseId, certificateNumber: cert.certificateNumber },
      { path: "/admin/certificates" },
    );

    revalidatePath("/admin");
    revalidatePath("/admin/certificates");
    revalidatePath(`/admin/users/${userId}`);

    return {
      success: true,
      certificateId: cert.id,
      certificateNumber: cert.certificateNumber,
    };
  } catch (e) {
    return { error: parseIssueError(e) };
  }
}

export type AdminRevokeCertificateState = {
  error?: string;
  success?: boolean;
};

function parseRevokeError(err: unknown): string {
  if (err instanceof Error) {
    if (err.message === "NOT_FOUND") return "Запись не найдена.";
    if (err.message === "ALREADY_REVOKED") return "Сертификат уже отозван.";
  }
  return "Не удалось отозвать сертификат.";
}

export async function adminRevokeCertificateAction(
  _prev: AdminRevokeCertificateState | null,
  formData: FormData,
): Promise<AdminRevokeCertificateState> {
  const session = await requireAdmin();

  if (!certificateSupportsRevoke()) {
    return { error: "Отзыв сертификатов не поддерживается." };
  }

  const certificateId = String(formData.get("certificateId") ?? "").trim();
  if (!certificateId) return { error: "Не указан сертификат." };

  const reason = certificateSupportsRevokeReason()
    ? normalizeRevokeReason(formData.get("reason"))
    : undefined;

  try {
    await revokeCertificate(certificateId, { reason });

    const auditMeta: Record<string, unknown> = {};
    if (reason) auditMeta.revokeReason = reason;

    logAdminSecurityEvent(
      session.user.id,
      SECURITY_ACTIONS.CERTIFICATE_REVOKE,
      certificateId,
      auditMeta,
      { path: "/admin/certificates" },
    );

    revalidatePath("/admin");
    revalidatePath("/admin/certificates");

    return { success: true };
  } catch (e) {
    return { error: parseRevokeError(e) };
  }
}
