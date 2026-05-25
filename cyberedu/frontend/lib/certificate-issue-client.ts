/** Безопасное сообщение для пользователя (без деталей сервера / stack). */
export const CERTIFICATE_ISSUE_GENERIC_ERROR =
  "Не удалось выдать сертификат. Попробуйте позже.";

export type CertificateIssueSuccessPayload = {
  certificateId: string;
  certificateNumber: string;
  issuedAt: string;
};

export type CertificateIssueResult =
  | { type: "created"; payload: CertificateIssueSuccessPayload }
  | { type: "already_issued" }
  | { type: "error"; message: string };

type GenerateApiBody = {
  certificateId?: string;
  certificateNumber?: string;
  issuedAt?: string;
  error?: string;
};

/**
 * Запрос выдачи сертификата (POST /api/certificates/generate).
 * Eligibility и запись — только на сервере; клиент не доверяет локальному прогрессу.
 */
export async function postCertificateIssue(courseId: string): Promise<CertificateIssueResult> {
  try {
    const res = await fetch("/api/certificates/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });

    const data = (await res.json().catch(() => ({}))) as GenerateApiBody;

    if (res.status === 409) {
      return { type: "already_issued" };
    }

    if (!res.ok) {
      return { type: "error", message: CERTIFICATE_ISSUE_GENERIC_ERROR };
    }

    const certificateId = data.certificateId?.trim();
    const certificateNumber = data.certificateNumber?.trim();
    const issuedAt = data.issuedAt?.trim();

    if (!certificateId || !certificateNumber || !issuedAt) {
      return { type: "error", message: CERTIFICATE_ISSUE_GENERIC_ERROR };
    }

    return {
      type: "created",
      payload: { certificateId, certificateNumber, issuedAt },
    };
  } catch {
    return { type: "error", message: CERTIFICATE_ISSUE_GENERIC_ERROR };
  }
}
