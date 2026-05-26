import { authSafe } from "@/lib/auth";
import { BrandLogoHeaderLink } from "@/components/brand/brand-logo";
import { FloatingNavShell } from "@/components/layout/floating-nav";
import { LandingHeaderNav } from "@/components/home/landing-header-nav";

export async function LandingHeader() {
  const session = await authSafe();
  const isAuthenticated = Boolean(session?.user);
  const dashboardHref = session?.user?.role === "ADMIN" ? "/admin" : "/dashboard";

  return (
    <FloatingNavShell transparentAtTop>
      <BrandLogoHeaderLink className="min-w-0 max-w-36 shrink-0 sm:max-w-44" />
      <LandingHeaderNav isAuthenticated={isAuthenticated} dashboardHref={dashboardHref} />
    </FloatingNavShell>
  );
}
