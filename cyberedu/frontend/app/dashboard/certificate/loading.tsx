import { CertificatePageLoading } from "@/components/certificate/certificate-states";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { LearnPageWrap } from "@/components/learn/learn-page-wrap";

export default function CertificateLoading() {
  return (
    <DashboardShell>
      <LearnPageWrap>
        <CertificatePageLoading />
      </LearnPageWrap>
    </DashboardShell>
  );
}
