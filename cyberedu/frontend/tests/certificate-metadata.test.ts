import { describe, expect, it } from "vitest";
import {
  CERTIFICATE_PRIVATE_DESCRIPTION,
  CERTIFICATE_PRIVATE_TITLE,
  CERTIFICATE_PUBLIC_VERIFY_DESCRIPTION,
  CERTIFICATE_PUBLIC_VERIFY_TITLE,
  buildCertificatePrivatePageMetadata,
  buildCertificatePublicVerifyLandingMetadata,
  buildCertificatePublicVerifyResultMetadata,
} from "@/lib/certificate-metadata";

describe("certificate-metadata", () => {
  it("private page uses fixed title without student data", () => {
    expect(CERTIFICATE_PRIVATE_TITLE).toBe("Сертификат — CyberEdu");
    expect(CERTIFICATE_PRIVATE_DESCRIPTION).toBe("Сертификат о прохождении курса CyberEdu.");
    const meta = buildCertificatePrivatePageMetadata();
    expect(meta.title).toEqual({ absolute: CERTIFICATE_PRIVATE_TITLE });
    expect(meta.robots).toMatchObject({ index: false, follow: false });
    const blob = JSON.stringify(meta);
    expect(blob).not.toMatch(/CE-\d{4}|Иван|lastName|verificationCode/i);
  });

  it("public verify landing is indexable with neutral og", () => {
    const meta = buildCertificatePublicVerifyLandingMetadata();
    expect(CERTIFICATE_PUBLIC_VERIFY_TITLE).toBe("Проверка сертификата — CyberEdu");
    expect(meta.robots).toMatchObject({ index: true, follow: true });
    expect(meta.openGraph?.title).toBe(CERTIFICATE_PUBLIC_VERIFY_TITLE);
    expect(meta.openGraph?.description).toBe(CERTIFICATE_PUBLIC_VERIFY_DESCRIPTION);
  });

  it("public verify result omits certificate number from title", () => {
    const meta = buildCertificatePublicVerifyResultMetadata();
    expect(meta.title).toEqual({ absolute: CERTIFICATE_PUBLIC_VERIFY_TITLE });
    expect(meta.robots).toMatchObject({ index: false, follow: false });
    const blob = JSON.stringify(meta);
    expect(blob).not.toMatch(/CE-\d{4}|valid|revoked|holderName/i);
  });
});
