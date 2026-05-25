/** Компактная строка verify URL для печати на PDF (без query с секретами). */
export function formatCertificateVerifyUrlForPdf(url: string, maxLen = 78): string {
  try {
    const u = new URL(url);
    const compact = `${u.host}${u.pathname}`;
    if (compact.length <= maxLen) return compact;
    return `${compact.slice(0, maxLen - 1)}…`;
  } catch {
    if (url.length <= maxLen) return url;
    return `${url.slice(0, maxLen - 1)}…`;
  }
}
