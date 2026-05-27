import Link from "next/link";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { BrandLogoFullImg } from "@/components/brand/brand-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-background">
      <header className="relative z-10 flex min-h-14 items-center justify-between gap-3 border-b border-border bg-card/95 px-4 backdrop-blur-sm sm:px-6">
        <Link href="/" className="block transition-opacity hover:opacity-90" aria-label="CyberEdu — на главную">
          <BrandLogoFullImg className="h-8 w-auto max-w-40" />
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle className="shrink-0" />
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <span className="hidden sm:inline">← На главную</span>
            <span className="sm:hidden">Главная</span>
          </Link>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="ce-app-auth-main relative flex w-full min-w-0 flex-1 flex-col">
        <AuthSplitLayout>{children}</AuthSplitLayout>
      </main>
    </div>
  );
}
