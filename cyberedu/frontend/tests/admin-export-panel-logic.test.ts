import { describe, expect, it } from "vitest";
import {
  adminExportFallbackFilename,
  parseAdminExportError,
  parseExportRowCount,
} from "@/lib/admin-export-panel-logic";
import { adminExportDownloadUrl, parseAdminExportType } from "@/lib/admin-export-types";

describe("admin export panel logic", () => {
  it("builds guarded download URLs", () => {
    expect(adminExportDownloadUrl("progress")).toBe("/api/admin/export?type=progress");
  });

  it("parses export types", () => {
    expect(parseAdminExportType("students")).toBe("students");
    expect(parseAdminExportType("invalid")).toBeNull();
  });

  it("maps HTTP errors for UI", () => {
    expect(parseAdminExportError(403, "")).toMatch(/прав/);
    expect(parseAdminExportError(429, "")).toMatch(/лимит/i);
    expect(parseAdminExportError(400, JSON.stringify({ error: "bad type" }))).toBe("bad type");
  });

  it("parses row count header", () => {
    expect(parseExportRowCount("42")).toBe(42);
    expect(parseExportRowCount("nope")).toBeNull();
  });

  it("fallback filename includes type and date", () => {
    expect(adminExportFallbackFilename("certificates")).toMatch(/^cyberedu-certificates-\d{4}-\d{2}-\d{2}\.csv$/);
  });
});
