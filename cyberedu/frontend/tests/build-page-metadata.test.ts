import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { buildPublicMetadata, siteBaseUrl } from "@/lib/seo/build-page-metadata";

describe("buildPublicMetadata", () => {
  const prev = process.env.NEXT_PUBLIC_APP_URL;

  afterEach(() => {
    if (prev === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
    else process.env.NEXT_PUBLIC_APP_URL = prev;
  });

  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = "https://learn.example.com/";
  });

  it("sets canonical and openGraph url", () => {
    const meta = buildPublicMetadata({
      title: "Отзывы",
      description: "Отзывы студентов",
      path: "/reviews",
    });
    expect(siteBaseUrl()).toBe("https://learn.example.com");
    expect(meta.alternates?.canonical).toBe("https://learn.example.com/reviews");
    expect(meta.openGraph?.url).toBe("https://learn.example.com/reviews");
  });
});
