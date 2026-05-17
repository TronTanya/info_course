import { MarketingShell } from "@/components/layout/marketing-shell";

export const dynamic = "force-dynamic";

export default function PublicGroupLayout({ children }: { children: React.ReactNode }) {
  return <MarketingShell>{children}</MarketingShell>;
}
