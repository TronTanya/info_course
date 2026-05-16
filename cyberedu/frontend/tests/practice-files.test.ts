import { describe, expect, it } from "vitest";
import { defaultPracticeUploadLimits } from "@/lib/practice-file-constants";
import { assertSafeUploadFilename, validateFileUpload, validatePracticeUpload } from "@/lib/practice-files";

describe("validateFileUpload / validatePracticeUpload", () => {
  it("принимает корректный PDF по сигнатуре", () => {
    const buf = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
    const r = validateFileUpload(buf, "report.pdf");
    expect(r).toEqual({ ok: true, ext: "pdf" });
    expect(validatePracticeUpload(buf, "report.pdf")).toEqual(r);
  });

  it("отклоняет запрещённое расширение в имени", () => {
    const r = assertSafeUploadFilename("evil.exe");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("не допускается");
  });

  it("отклоняет несоответствие содержимого и расширения", () => {
    const buf = Buffer.from("not a pdf");
    const r = validateFileUpload(buf, "fake.pdf", defaultPracticeUploadLimits());
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("PDF");
  });

  it("отклоняет слишком большой файл", () => {
    const buf = Buffer.alloc(100);
    buf.set([0x25, 0x50, 0x44, 0x46], 0);
    const r = validateFileUpload(buf, "x.pdf", { maxBytes: 10, allowedExts: ["pdf"] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("МБ");
  });
});
