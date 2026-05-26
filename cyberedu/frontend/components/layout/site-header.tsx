import { authSafe } from "@/lib/auth";
import { BrandLogoHeaderLink } from "@/components/brand/brand-logo";
import { FloatingNavShell } from "@/components/layout/floating-nav";
import { SiteHeaderNav } from "@/components/layout/site-header-nav";

export async function SiteHeader() {
  const session = await authSafe();
  const role = session?.user?.role;
  const variant = !session?.user ? "guest" : role === "ADMIN" ? "admin" : "user";
  const user = session?.user
    ? { name: session.user.name, email: session.user.email, role: session.user.role }
    : null;

  return (
    <FloatingNavShell>
      <BrandLogoHeaderLink className="min-w-0 max-w-36 shrink-0 sm:max-w-44" />
      <SiteHeaderNav variant={variant} user={user} />
    </FloatingNavShell>
  );
}
