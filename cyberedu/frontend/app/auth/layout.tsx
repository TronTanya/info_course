import Link from "next/link";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { BrandLogoFullImg } from "@/components/brand/brand-logo";
import { TechAmbient } from "@/components/effects/tech-ambient";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip">
      <TechAmbient />
      <header className="relative z-10 flex min-h-14 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-md sm:px-6">
        <Link href="/" className="block transition-opacity hover:opacity-90" aria-label="CyberEdu — на главную">
          <BrandLogoFullImg className="h-8 w-auto max-w-[10rem]" />
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          ← На главную
        </Link>
      </header>
      <main className="ce-app-auth-main relative flex w-full min-w-0 flex-1 flex-col">
        <AuthSplitLayout>{children}</AuthSplitLayout>
      </main>
    </div>
  );
}
