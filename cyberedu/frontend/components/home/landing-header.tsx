import { authSafe } from "@/lib/auth";
import { BrandLogoHeaderLink } from "@/components/brand/brand-logo";
import { LandingHeaderNav } from "@/components/home/landing-header-nav";

export async function LandingHeader() {
  const session = await authSafe();
  const isAuthenticated = Boolean(session?.user);
  const dashboardHref = session?.user?.role === "ADMIN" ? "/admin" : "/dashboard";

  return (
    <header className="ce-landing-header sticky top-0 z-50 supports-[backdrop-filter]:bg-background/60">
      <div className="container-page flex min-w-0 items-center gap-3 py-3 sm:gap-4 sm:py-3.5">
        <BrandLogoHeaderLink className="min-w-0 shrink" />
        <LandingHeaderNav isAuthenticated={isAuthenticated} dashboardHref={dashboardHref} />
      </div>
    </header>
  );
}
