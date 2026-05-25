import { HOME_PAGE_DESCRIPTION, HOME_PAGE_TITLE } from "@/lib/seo/home-page-metadata";

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function homePageJsonLd(appUrl: string) {
  const url = appUrl.replace(/\/$/, "");
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "CyberEdu",
      url,
      inLanguage: "ru-RU",
      description: HOME_PAGE_DESCRIPTION,
    },
    {
      "@context": "https://schema.org",
      "@type": "Course",
      name: HOME_PAGE_TITLE,
      description: HOME_PAGE_DESCRIPTION,
      provider: {
        "@type": "Organization",
        name: "CyberEdu",
        url,
      },
      url: `${url}/auth/register`,
      courseMode: "online",
      inLanguage: "ru-RU",
      educationalLevel: "Beginner",
      teaches: "Information security fundamentals",
    },
  ];
}
