import { describe, expect, it } from "vitest";
import { certificateRegistryStatus } from "@/lib/certificates-admin-panel-logic";

describe("certificates-admin-panel-logic", () => {
  it("marks registry status active when no revoke field", () => {
    expect(certificateRegistryStatus(true)).toBe("active");
    expect(certificateRegistryStatus(true, false)).toBe("active");
  });

  it("supports revoked only when explicitly passed", () => {
    expect(certificateRegistryStatus(true, true)).toBe("revoked");
  });
});
