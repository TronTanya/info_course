import Link from "next/link";
import { BrandLogoFullImg } from "@/components/brand/brand-logo";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Короткий бренд-блок на мобильных экранах auth. */
export function AuthBrandStrip({ className }: { className?: string }) {
  return (
    <div className={cn("ce-auth-brand-strip flex flex-col items-center gap-3 text-center lg:hidden", className)}>
      <Link href="/" className="block transition-opacity hover:opacity-90">
        <BrandLogoFullImg className="mx-auto max-h-10 w-auto" />
      </Link>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge variant="primary">Cyber Lab</Badge>
        <Badge variant="cyan">Secure Mode</Badge>
      </div>
      <p className="font-mono text-xs text-muted-foreground">
        <span className="text-primary">auth</span> --secure-session
      </p>
    </div>
  );
}
