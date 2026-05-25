import { headers } from "next/headers";
import { mapVerifyPayloadToPresentationModel } from "@/lib/certificate-view-model";
import type { CertificateVerifyPresentationModel } from "@/types/certificate-view-model";
import { resolveCertificateVerifyPayload } from "@/lib/certificate-verify";
import { SECURITY_ACTIONS } from "@/lib/security/audit-actions";
import { logSecurityEvent } from "@/lib/security/audit";
import { enforceRateLimit, RATE_LIMIT_POLICIES } from "@/lib/security/rate-limit";
import { clientIpFromHeaders } from "@/lib/security/request-ip";

export async function runPublicCertificateVerify(
  identifier: string,
  auditPath: string,
): Promise<CertificateVerifyPresentationModel> {
  const h = await headers();
  const clientIp = clientIpFromHeaders(h);
  const certPolicy = RATE_LIMIT_POLICIES.certVerify;
  const certRl = await enforceRateLimit({
    scope: certPolicy.scope,
    clientIp,
    max: certPolicy.max,
    windowMs: certPolicy.windowMs,
  });

  if (!certRl.allowed) {
    logSecurityEvent({
      action: SECURITY_ACTIONS.CERTIFICATE_VERIFY_ABUSE,
      severity: "warn",
      ip: clientIp,
      path: auditPath,
      metadata: { reason: "rate_limited" },
    });
    return mapVerifyPayloadToPresentationModel({ status: "rate_limited" });
  }

  const payload = await resolveCertificateVerifyPayload(identifier);
  const result = mapVerifyPayloadToPresentationModel(payload);

  if (payload.status === "not_found") {
    logSecurityEvent({
      action: SECURITY_ACTIONS.CERTIFICATE_VERIFY_FAILED,
      severity: "info",
      ip: clientIp,
      path: auditPath,
      metadata: { reason: "not_found", idPrefix: identifier.slice(0, 12) },
    });
  }

  return result;
}
