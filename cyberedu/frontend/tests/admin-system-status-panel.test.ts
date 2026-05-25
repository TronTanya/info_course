import { afterEach, describe, expect, it } from "vitest";
import {
  buildSystemStatusPanelData,
  isUnsafeOpsTimestampValue,
} from "@/lib/admin-system-status-panel";

describe("buildSystemStatusPanelData", () => {
  const envBackup: NodeJS.ProcessEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it("maps readiness checks to safe health statuses", () => {
    const panel = buildSystemStatusPanelData({
      database: "ok",
      redis: "skipped",
    });
    expect(panel).toMatchObject({
      database: "ok",
      ai: "disabled",
      storage: "ok",
    });
    expect(panel.redis).toBeUndefined();
  });

  it("shows redis when checked in production-like env", () => {
    const panel = buildSystemStatusPanelData({
      database: "error",
      redis: "error",
    });
    expect(panel.database).toBe("degraded");
    expect(panel.redis).toBe("degraded");
  });

  it("includes ops timestamps only when safe ISO values", () => {
    process.env.ADMIN_LAST_BACKUP_AT = "2026-05-20T03:00:00.000Z";
    process.env.ADMIN_LAST_SMOKE_TEST_AT = "postgres://secret";
    const panel = buildSystemStatusPanelData({ database: "ok", redis: "skipped" });
    expect(panel.lastBackupAt).toBe("2026-05-20T03:00:00.000Z");
    expect(panel.lastSmokeTestAt).toBeUndefined();
  });

  it("rejects connection-string-like ops values", () => {
    process.env.ADMIN_LAST_BACKUP_AT = "redis://127.0.0.1:6379";
    const panel = buildSystemStatusPanelData({ database: "ok", redis: "skipped" });
    expect(panel.lastBackupAt).toBeUndefined();
  });

  it("rejects internal hostnames and env-like ops values", () => {
    expect(isUnsafeOpsTimestampValue("db.internal.corp:5432")).toBe(true);
    expect(isUnsafeOpsTimestampValue("backup@postgres.local")).toBe(true);
    expect(isUnsafeOpsTimestampValue("OPENAI_API_KEY=sk-test")).toBe(true);
    expect(isUnsafeOpsTimestampValue("2026-05-20T03:00:00.000Z")).toBe(false);
  });

  it("panel payload never includes connection or env fields", () => {
    process.env.ADMIN_LAST_BACKUP_AT = "2026-05-21T12:00:00.000Z";
    const panel = buildSystemStatusPanelData({ database: "ok", redis: "ok" });
    const serialized = JSON.stringify(panel);
    expect(serialized).not.toMatch(/postgres|redis:\/\//i);
    expect(Object.keys(panel).sort()).toEqual(
      ["ai", "database", "lastBackupAt", "redis", "storage"].sort(),
    );
  });
});
