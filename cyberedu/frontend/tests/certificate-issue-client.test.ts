import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  CERTIFICATE_ISSUE_GENERIC_ERROR,
  postCertificateIssue,
} from "@/lib/certificate-issue-client";

describe("postCertificateIssue", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns created payload on success", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        certificateId: "cert-1",
        certificateNumber: "CE-2026-ABCD1234",
        issuedAt: "2026-05-22T10:00:00.000Z",
      }),
    });

    const result = await postCertificateIssue("course-1");
    expect(result).toEqual({
      type: "created",
      payload: {
        certificateId: "cert-1",
        certificateNumber: "CE-2026-ABCD1234",
        issuedAt: "2026-05-22T10:00:00.000Z",
      },
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/certificates/generate", expect.objectContaining({ method: "POST" }));
  });

  it("returns already_issued on 409 without leaking server error text", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ error: "Сертификат уже выдан." }),
    });

    const result = await postCertificateIssue("course-1");
    expect(result).toEqual({ type: "already_issued" });
  });

  it("returns generic error on 403 and network failure", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ error: "Курс не завершён: internal detail" }),
    });
    expect(await postCertificateIssue("c1")).toEqual({
      type: "error",
      message: CERTIFICATE_ISSUE_GENERIC_ERROR,
    });

    fetchMock.mockRejectedValueOnce(new Error("network down"));
    expect(await postCertificateIssue("c1")).toEqual({
      type: "error",
      message: CERTIFICATE_ISSUE_GENERIC_ERROR,
    });
  });

  it("does not expose verificationCode in success payload shape", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        certificateId: "cert-1",
        certificateNumber: "CE-2026-X",
        issuedAt: "2026-05-22T10:00:00.000Z",
        verificationCode: "secret-should-not-be-used",
      }),
    });
    const result = await postCertificateIssue("c1");
    expect(result.type).toBe("created");
    if (result.type === "created") {
      expect(JSON.stringify(result.payload)).not.toMatch(/verificationCode/i);
    }
  });
});
