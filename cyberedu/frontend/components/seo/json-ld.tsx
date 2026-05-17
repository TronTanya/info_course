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
      description: "Образовательная платформа по основам информационной безопасности.",
    },
    {
      "@context": "https://schema.org",
      "@type": "Course",
      name: "Курс по информационной безопасности",
      description:
        "Модульный курс: лекции, тесты, практические задания, AI-наставник и сертификат о прохождении.",
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
