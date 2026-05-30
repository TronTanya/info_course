import { BrandLogoHeaderLink } from "@/components/brand/brand-logo";
import { FloatingNavShell } from "@/components/layout/floating-nav";
import { LandingHeaderNav } from "@/components/home/landing-header-nav";

export function LandingHeader() {
  return (
    <FloatingNavShell transparentAtTop>
      <BrandLogoHeaderLink className="min-w-0 max-w-36 shrink-0 sm:max-w-44" />
      <LandingHeaderNav />
    </FloatingNavShell>
  );
}
