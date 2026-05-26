import { LandingHeroCinematic } from "@/components/home/landing-hero/landing-hero-cinematic";
import { authSafe } from "@/lib/auth";

export async function LandingHero() {
  const session = await authSafe();
  const isAuthenticated = Boolean(session?.user);
  const startHref = isAuthenticated ? "/dashboard/course" : "/auth/register";
  const programHref = "#product";

  return <LandingHeroCinematic startHref={startHref} programHref={programHref} />;
}
