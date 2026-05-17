import Link from "next/link";
import { BrandLogoFullImg } from "@/components/brand/brand-logo";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen min-w-0 flex-col">
      <SiteHeader />
      <main className="ce-app-auth-main hero-glow relative flex w-full min-w-0 flex-1 items-center justify-center px-4 py-12 sm:px-5">
        <div className="flex w-full max-w-lg min-w-0 flex-col items-center gap-6">
          <Link href="/" className="block w-full max-w-sm transition-opacity hover:opacity-90">
            <BrandLogoFullImg className="mx-auto" />
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            ← На главную
          </Link>
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
