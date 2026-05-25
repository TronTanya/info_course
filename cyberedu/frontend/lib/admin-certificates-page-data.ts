import { getAdminCertificateEligibleRows } from "@/lib/admin-certificate-eligible";
import { getAdminCertificateRows } from "@/lib/admin-certificates-list";
import { certificateSupportsRevoke, certificateSupportsRevokeReason } from "@/lib/certificate-registry";
import {
  mapAdminCertificateRowToItem,
  mapEligibleRowToAdminCertificateItem,
} from "@/lib/certificate-view-model";
import { getCertificatesAdminPanelData } from "@/lib/certificates-admin-panel";
import type { AdminCertificateItem } from "@/types/certificate-view-model";

export type AdminCertificatesPageData = {
  panel: Awaited<ReturnType<typeof getCertificatesAdminPanelData>>;
  supportsRevoke: boolean;
  supportsRevokeReason: boolean;
  issuedItems: AdminCertificateItem[];
  eligibleItems: AdminCertificateItem[];
  counts: {
    issued: number;
    revoked: number;
    ready: number;
    total: number;
  };
};

export async function getAdminCertificatesPageData(): Promise<AdminCertificatesPageData> {
  const [rows, panel, eligibleRows] = await Promise.all([
    getAdminCertificateRows(),
    getCertificatesAdminPanelData(),
    getAdminCertificateEligibleRows(50),
  ]);

  const issuedItems = rows.map(mapAdminCertificateRowToItem);
  const eligibleItems = eligibleRows.map(mapEligibleRowToAdminCertificateItem);
  const issued = issuedItems.filter((r) => r.status === "issued").length;
  const revoked = issuedItems.filter((r) => r.status === "revoked").length;

  return {
    panel,
    supportsRevoke: certificateSupportsRevoke(),
    supportsRevokeReason: certificateSupportsRevokeReason(),
    issuedItems,
    eligibleItems,
    counts: {
      issued,
      revoked,
      ready: eligibleItems.length,
      total: issuedItems.length + eligibleItems.length,
    },
  };
}
