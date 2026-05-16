import { MarketingShell } from "@/components/layout/marketing-shell";

export default function PublicGroupLayout({ children }: { children: React.ReactNode }) {
  return <MarketingShell>{children}</MarketingShell>;
}
