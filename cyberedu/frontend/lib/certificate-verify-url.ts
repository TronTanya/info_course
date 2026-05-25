export function publicAppBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "http://localhost:3100";
}

/** Публичный номер реестра: CE-ГОД-суффикс (без email и внутренних id). */
export const PUBLIC_CERTIFICATE_NUMBER_RE = /^CE-\d{4}-[A-Z0-9-]{4,40}$/;

/** Legacy: hex-код из старых PDF/QR (не публикуем в новых ссылках). */
const LEGACY_VERIFICATION_CODE_RE = /^[a-f0-9]{20,64}$/i;

export function certificateVerifyPath(certificateNumber: string): string {
  const normalized = normalizePublicCertificateNumber(certificateNumber);
  if (!normalized) {
    throw new Error("INVALID_CERTIFICATE_NUMBER");
  }
  return `/verify/${encodeURIComponent(normalized)}`;
}

/** Абсолютный URL публичной проверки (только номер реестра, без verificationCode). */
export function certificateVerifyUrl(certificateNumber: string): string {
  return `${publicAppBaseUrl()}${certificateVerifyPath(certificateNumber)}`;
}

export function normalizePublicCertificateNumber(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const fromVerifyPath =
    trimmed.match(/\/verify\/([^/?#]+)/i)?.[1] ??
    trimmed.match(/\/certificate\/verify\/([^/?#]+)/i)?.[1];

  let candidate = (fromVerifyPath ?? trimmed).replace(/\s+/g, "").toUpperCase();
  try {
    candidate = decodeURIComponent(candidate);
  } catch {
    /* keep candidate */
  }

  if (PUBLIC_CERTIFICATE_NUMBER_RE.test(candidate)) {
    return candidate;
  }
  return null;
}

export function normalizeLegacyVerificationCode(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const fromUrl = trimmed.match(/\/certificate\/verify\/([a-f0-9]+)/i)?.[1];
  const code = (fromUrl ?? trimmed).replace(/\s+/g, "");
  return LEGACY_VERIFICATION_CODE_RE.test(code) ? code.toLowerCase() : null;
}

export function parseCertificateVerifyLookupInput(raw: string): {
  kind: "certificateNumber";
  value: string;
} | {
  kind: "legacyVerificationCode";
  value: string;
} | null {
  const number = normalizePublicCertificateNumber(raw);
  if (number) return { kind: "certificateNumber", value: number };

  const legacy = normalizeLegacyVerificationCode(raw);
  if (legacy) return { kind: "legacyVerificationCode", value: legacy };

  return null;
}
