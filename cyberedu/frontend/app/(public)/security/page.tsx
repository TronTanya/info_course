import type { Metadata } from "next";
import { PublicSecurityPage } from "@/components/security/public-security-page";
import { buildPublicMetadata } from "@/lib/seo/build-page-metadata";

export const metadata: Metadata = buildPublicMetadata({
  title: "Безопасность платформы",
  description:
    "Как CyberEdu защищает аккаунты, курс, AI-наставника и сертификаты: RBAC, rate limiting, audit log и server-side проверки.",
  path: "/security",
});

export default function SecurityOverviewPage() {
  return <PublicSecurityPage />;
}
