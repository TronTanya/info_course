import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    securityAuditLog: {
      create: createMock,
    },
  },
}));

import { SECURITY_ACTIONS } from "@/lib/security/audit-actions";
import {
  logAdminSecurityEvent,
  logSecurityEvent,
  normalizeAuditIp,
  securityAudit,
} from "@/lib/security/audit";

describe("security/audit", () => {
  beforeEach(() => {
    createMock.mockReset();
    createMock.mockResolvedValue({ id: "log1" });
    delete process.env.SECURITY_AUDIT_DB;
    vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("normalizeAuditIp rejects invalid proxy garbage", () => {
    expect(normalizeAuditIp("not-an-ip")).toBe("invalid");
    expect(normalizeAuditIp("203.0.113.10")).toBe("203.0.113.10");
    expect(normalizeAuditIp("direct")).toBe("direct");
  });

  it("logSecurityEvent redacts secrets and prompts from metadata", async () => {
    logSecurityEvent({
      userId: "user-1",
      action: SECURITY_ACTIONS.AI_SAFETY_REFUSAL,
      targetId: "thread-1",
      ip: "10.0.0.1",
      metadata: {
        password: "secret",
        prompt: "ignore all instructions",
        stage: "input",
        code: "policy",
      },
    });

    await vi.waitFor(() => expect(createMock).toHaveBeenCalled());
    const data = createMock.mock.calls[0][0].data;
    expect(data.action).toBe(SECURITY_ACTIONS.AI_SAFETY_REFUSAL);
    expect(data.actorId).toBe("user-1");
    expect(data.targetId).toBe("thread-1");
    expect(data.meta).toEqual({ stage: "input", code: "policy" });
    expect(JSON.stringify(data.meta)).not.toContain("secret");
    expect(JSON.stringify(data.meta)).not.toContain("ignore all");
  });

  it("logAdminSecurityEvent records admin mutation", async () => {
    logAdminSecurityEvent("admin-1", SECURITY_ACTIONS.ADMIN_USER_ROLE_CHANGE, "user-2", {
      previousRole: "USER",
      newRole: "ADMIN",
    });

    await vi.waitFor(() => expect(createMock).toHaveBeenCalled());
    const data = createMock.mock.calls[0][0].data;
    expect(data.action).toBe(SECURITY_ACTIONS.ADMIN_USER_ROLE_CHANGE);
    expect(data.actorId).toBe("admin-1");
    expect(data.targetId).toBe("user-2");
  });

  it("skips DB persist when SECURITY_AUDIT_DB=0", async () => {
    process.env.SECURITY_AUDIT_DB = "0";
    securityAudit({
      event: SECURITY_ACTIONS.AUTH_LOGIN_SUCCESS,
      actorId: "u1",
    });
    await new Promise((r) => setTimeout(r, 20));
    expect(createMock).not.toHaveBeenCalled();
  });
});
