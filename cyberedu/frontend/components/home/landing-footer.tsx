import Link from "next/link";
import { BrandLogoHeaderLink } from "@/components/brand/brand-logo";
import { landingFooterNavLinks } from "@/lib/design-system/nav-config";

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="ce-landing-footer mt-auto border-t border-border/80 bg-linear-to-b from-background/95 to-card/40">
      <div className="container-page py-10 sm:py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm space-y-3">
            <BrandLogoHeaderLink className="w-fit" />
            <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
              Практическая платформа обучения информационной безопасности.
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-8 gap-y-1 sm:grid-cols-3" aria-label="Подвал">
            {landingFooterNavLinks.map((item) =>
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>
        </div>
      </div>
      <div className="container-page border-t border-border/60 py-4">
        <p className="text-sm text-muted-foreground">© {year} CyberEdu</p>
      </div>
    </footer>
  );
}
