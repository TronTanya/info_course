/** Заголовок и текст для Web Share / буфера (без PII). */
export const CERTIFICATE_SHARE_TITLE = "CyberEdu — проверка сертификата";

export function certificateShareText(certificateNumber?: string): string {
  if (certificateNumber?.trim()) {
    return `Проверьте подлинность сертификата ${certificateNumber.trim()} в реестре CyberEdu Academy`;
  }
  return "Проверьте подлинность сертификата CyberEdu Academy";
}

const FORBIDDEN_QUERY_KEYS = /^(email|user|userid|user_id|token|session|code|secret)/i;

/**
 * URL, безопасный для копирования и шаринга: только публичный verify-путь, без query с PII.
 * Возвращает origin + pathname или null, если URL не подходит.
 */
export function sanitizePublicVerifyShareUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname.includes("/dashboard")) return null;
    if (!parsed.pathname.includes("/verify")) return null;

    for (const key of parsed.searchParams.keys()) {
      if (FORBIDDEN_QUERY_KEYS.test(key)) return null;
    }

    if (parsed.search) return null;

    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return null;
  }
}

export function canUseWebShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export async function copyTextToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

export type SharePublicVerifyResult = "shared" | "copied" | "cancelled";

/**
 * Web Share API с fallback на копирование verify URL (без query).
 */
export async function sharePublicVerifyUrl(
  verifyUrl: string,
  options?: { certificateNumber?: string },
): Promise<SharePublicVerifyResult> {
  const safe = sanitizePublicVerifyShareUrl(verifyUrl);
  if (!safe) {
    throw new Error("INVALID_SHARE_URL");
  }

  if (canUseWebShare()) {
    try {
      await navigator.share({
        title: CERTIFICATE_SHARE_TITLE,
        text: certificateShareText(options?.certificateNumber),
        url: safe,
      });
      return "shared";
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        return "cancelled";
      }
      throw e;
    }
  }

  await copyTextToClipboard(safe);
  return "copied";
}
