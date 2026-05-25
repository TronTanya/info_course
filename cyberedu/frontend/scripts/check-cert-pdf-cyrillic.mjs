import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { writeFileSync } from "node:fs";
import { CertificatePdfDocument } from "../lib/certificate-pdf.tsx";

const payload = {
  fullName: "Иванов Иван",
  courseTitle: "Основы информационной безопасности",
  courseHours: 36,
  courseStartedAt: new Date("2026-01-01"),
  courseCompletedAt: new Date("2026-04-01"),
  totalScore: 100,
  certificateNumber: "CE-2026-TEST",
  verificationCode: "abc123",
  verifyUrl: "http://localhost:3100/verify/CE-2026-TESTPDF1",
  issuedAt: new Date("2026-05-01"),
  organizationLine: "CyberEdu Academy",
  signatoryLine: "Руководитель платформы",
  qrDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
};

const buf = await renderToBuffer(createElement(CertificatePdfDocument, payload));
writeFileSync("/tmp/cert-test.pdf", buf);
const raw = buf.toString("latin1");
console.log("raw includes Иванов:", raw.includes("Иванов"));
console.log("raw includes Сертификат:", raw.includes("Сертификат"));
