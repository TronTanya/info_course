import { describe, expect, it } from "vitest";
import { mapPracticeEvidenceBlocksToItems } from "@/lib/evidence-panel-map";
import {
  extractHttpLinksFromText,
  isSafePracticeFileUrl,
  parseLogContent,
  parseUrlForDisplay,
} from "@/lib/evidence-panel";
import type { PracticeEvidenceBlock } from "@/lib/practice-scenario-parse";

describe("evidence-panel utils", () => {
  it("parseUrlForDisplay extracts protocol domain path", () => {
    const d = parseUrlForDisplay("https://evil.example/phish?id=1", "Click here");
    expect(d.protocol).toBe("https");
    expect(d.domain).toBe("evil.example");
    expect(d.path).toContain("/phish");
    expect(d.visibleText).toBe("Click here");
  });

  it("isSafePracticeFileUrl allows only practice download API", () => {
    expect(isSafePracticeFileUrl("/api/practice/download?id=abc")).toBe(true);
    expect(isSafePracticeFileUrl("/uploads/secret.pdf")).toBe(false);
    expect(isSafePracticeFileUrl("file:///tmp/x")).toBe(false);
    expect(isSafePracticeFileUrl("/api/practice/download?id=../etc")).toBe(false);
  });

  it("parseLogContent splits timestamp and event", () => {
    const rows = parseLogContent("2026-05-13 10:12:04 LOGIN_FAILED user=admin");
    expect(rows[0]?.timestamp).toMatch(/2026-05-13/);
    expect(rows[0]?.event).toContain("LOGIN_FAILED");
  });

  it("extractHttpLinksFromText finds urls in body", () => {
    const links = extractHttpLinksFromText("См. https://bad.example/x и http://test.local");
    expect(links).toHaveLength(2);
  });
});

describe("mapPracticeEvidenceBlocksToItems", () => {
  it("maps email with attachments and does not expose storage paths", () => {
    const blocks: PracticeEvidenceBlock[] = [
      {
        kind: "email",
        from: "a@evil.test",
        to: "user@corp.test",
        subject: "Urgent",
        date: "2026-05-13",
        body: "Open https://phish.example/login",
        attachments: [{ name: "invoice.pdf", size: "12 KB", mimeType: "application/pdf" }],
      },
    ];
    const items = mapPracticeEvidenceBlocksToItems(blocks);
    expect(items[0]?.type).toBe("email");
    expect(items[0]?.links?.some((l) => l.includes("phish.example"))).toBe(true);
    expect(JSON.stringify(items)).not.toMatch(/storagePath|private/i);
  });

  it("maps log with logEntries", () => {
    const items = mapPracticeEvidenceBlocksToItems([
      { kind: "log", title: "Auth", lines: "2026-01-01 12:00:00 ERROR auth fail" },
    ]);
    expect(items[0]?.logEntries?.length).toBe(1);
  });

  it("maps table with structured rows", () => {
    const items = mapPracticeEvidenceBlocksToItems([
      {
        kind: "indicator_table",
        title: "Indicators",
        headers: ["Sign", "Note"],
        rows: [{ feature: "spf", note: "fail" }],
      },
    ]);
    expect(items[0]?.tableRows?.[0]?.feature).toBe("spf");
  });
});
