import { requireAuth } from "@/lib/permissions";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();

  return (
    <div className="flex min-h-screen min-w-0 flex-col">
      <SiteHeader />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      <SiteFooter />
    </div>
  );
}
