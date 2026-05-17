import { describe, expect, it } from "vitest";
import { defaultPracticeUploadLimits } from "@/lib/practice-file-constants";
import { validateFileUpload, validatePracticeUpload } from "@/lib/practice-files";
import {
  assertBinaryMatchesExtension,
  assertSafeUploadFilename,
  rejectExecutableMagic,
  safeFileExtension,
} from "@/lib/security/upload-sandbox";

const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);

describe("security/upload sandbox", () => {
  it("rejects forbidden extension in filename", () => {
    const r = assertSafeUploadFilename("payload.exe");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/не допускается/i);
  });

  it("rejects PE magic bytes", () => {
    const buf = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x00]);
    const r = rejectExecutableMagic(buf);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/исполняемый/i);
  });

  it("rejects PDF extension with non-PDF magic bytes", () => {
    const r = assertBinaryMatchesExtension(Buffer.from("not-a-pdf"), "pdf");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/PDF/i);
  });

  it("accepts valid PDF magic for pdf extension", () => {
    expect(assertBinaryMatchesExtension(PDF_MAGIC, "pdf")).toEqual({ ok: true });
  });

  it("safeFileExtension normalizes extension", () => {
    expect(safeFileExtension("report.PDF")).toBe("pdf");
  });
});

describe("security/upload practice validation", () => {
  it("accepts allowed file within size limit", () => {
    const r = validatePracticeUpload(PDF_MAGIC, "lab-report.pdf");
    expect(r).toEqual({ ok: true, ext: "pdf" });
    expect(validateFileUpload(PDF_MAGIC, "lab-report.pdf")).toEqual(r);
  });

  it("rejects file exceeding maxBytes with clear error", () => {
    const big = Buffer.alloc(200);
    big.set(PDF_MAGIC.subarray(0, 4), 0);
    const r = validateFileUpload(big, "big.pdf", { maxBytes: 50, allowedExts: ["pdf"] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/МБ/i);
  });

  it("rejects disallowed extension even with valid magic", () => {
    const r = validateFileUpload(PDF_MAGIC, "file.xyz", {
      ...defaultPracticeUploadLimits(),
      allowedExts: ["pdf"],
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/Разрешены только/i);
  });

  it("rejects empty upload", () => {
    const r = validatePracticeUpload(Buffer.alloc(0), "empty.pdf");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/Пустой файл/i);
  });
});
