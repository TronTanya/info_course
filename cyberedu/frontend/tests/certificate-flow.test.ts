import { describe, expect, it } from "vitest";
import { resolveCertificateUserFlow } from "@/lib/certificate-flow";

describe("certificate-flow", () => {
  it("maps lifecycle to three student flows", () => {
    expect(resolveCertificateUserFlow("not_started")).toBe("progress");
    expect(resolveCertificateUserFlow("in_progress")).toBe("progress");
    expect(resolveCertificateUserFlow("ready_to_issue")).toBe("ready");
    expect(resolveCertificateUserFlow("issued")).toBe("issued");
  });
});
