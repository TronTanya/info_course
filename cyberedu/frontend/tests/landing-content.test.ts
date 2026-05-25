import { describe, expect, it } from "vitest";
import {
  LANDING_CERTIFICATE_PREVIEW,
  LANDING_CERT_VERIFY_HREF,
  LANDING_FAQ,
  LANDING_HERO_ROADMAP,
  LANDING_HERO_TRUST_NOTES,
  LANDING_HOW_IT_WORKS,
  LANDING_MENTOR_MODES,
  LANDING_PROGRAM_MODULE_FORMAT,
  LANDING_PROGRAM_MODULES,
  LANDING_PRACTICE_LABS,
  LANDING_TRUST_ITEMS,
} from "@/lib/landing-content";

describe("landing-content", () => {
  it("exposes trust strip items", () => {
    expect(LANDING_TRUST_ITEMS).toHaveLength(4);
    expect(LANDING_TRUST_ITEMS.map((i) => i.title)).toContain("Практические лаборатории");
  });

  it("exposes program and practice previews", () => {
    expect(LANDING_PROGRAM_MODULES).toHaveLength(5);
    expect(LANDING_PROGRAM_MODULES[0]?.title).toBe("Основы информационной безопасности");
    expect(LANDING_PROGRAM_MODULES.every((m) => m.formatPreview === LANDING_PROGRAM_MODULE_FORMAT)).toBe(
      true,
    );
    expect(LANDING_PRACTICE_LABS).toHaveLength(4);
  });

  it("exposes five mentor modes for landing", () => {
    expect(LANDING_MENTOR_MODES).toHaveLength(5);
    expect(LANDING_MENTOR_MODES.map((m) => m.label)).toEqual([
      "Объясни проще",
      "Приведи пример",
      "Проверь понимание",
      "Дай подсказку",
      "Сделай конспект",
    ]);
  });

  it("exposes faq items from spec", () => {
    expect(LANDING_FAQ).toHaveLength(6);
    expect(LANDING_FAQ[0]?.q).toBe("Для кого этот курс?");
  });

  it("exposes hero trust notes and roadmap", () => {
    expect(LANDING_HERO_TRUST_NOTES).toHaveLength(4);
    expect(LANDING_HERO_ROADMAP).toHaveLength(3);
  });

  it("exposes certificate preview demo", () => {
    expect(LANDING_CERTIFICATE_PREVIEW.certificateId).toBe("CE-2026-DEMO0001");
    expect(LANDING_CERTIFICATE_PREVIEW.recipientName).toBe("Анна Иванова");
    expect(LANDING_CERT_VERIFY_HREF).toContain("CE-2026-DEMO0001");
  });

  it("exposes five how-it-works steps", () => {
    expect(LANDING_HOW_IT_WORKS).toHaveLength(5);
    expect(LANDING_HOW_IT_WORKS[1]?.description).toContain("серверную проверку");
    expect(LANDING_HOW_IT_WORKS[4]?.title).toBe("Сертификат");
  });
});
