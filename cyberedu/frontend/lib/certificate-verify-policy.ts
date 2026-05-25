/** Показывать ФИО на публичной странице verify (по умолчанию — нет). */
export function certificateVerifyShowsHolderName(): boolean {
  const v = process.env.CERTIFICATE_VERIFY_SHOW_HOLDER_NAME?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/** Срок действия сертификата (expiresAt) в схеме не реализован. */
export function certificateSupportsExpiry(): boolean {
  return false;
}
