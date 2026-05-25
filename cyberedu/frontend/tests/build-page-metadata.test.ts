import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  buildPublicMetadata,
  LANDING_OG_PREVIEW,
  siteBaseUrl,
} from "@/lib/seo/build-page-metadata";
import {
  HOME_PAGE_DESCRIPTION,
  HOME_PAGE_TITLE,
  buildHomePageMetadata,
} from "@/lib/seo/home-page-metadata";

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
    expect(meta.openGraph?.locale).toBe("ru_RU");
    expect(meta.openGraph?.siteName).toBe("CyberEdu");
    const og = meta.openGraph as { type?: string } | undefined;
    const twitter = meta.twitter as { card?: string } | undefined;
    expect(og?.type).toBe("website");
    expect(twitter?.card).toBe("summary");
  });

  it("uses summary_large_image when og image is provided", () => {
    const meta = buildPublicMetadata({
      title: HOME_PAGE_TITLE,
      description: HOME_PAGE_DESCRIPTION,
      path: "/",
      ogImage: LANDING_OG_PREVIEW,
    });
    const twitter = meta.twitter as { card?: string } | undefined;
    expect(twitter?.card).toBe("summary_large_image");
    expect(meta.openGraph?.images).toEqual([
      {
        url: LANDING_OG_PREVIEW.path,
        width: LANDING_OG_PREVIEW.width,
        height: LANDING_OG_PREVIEW.height,
        alt: LANDING_OG_PREVIEW.alt,
      },
    ]);
    expect(meta.openGraph?.title).toBe(HOME_PAGE_TITLE);
    expect(meta.openGraph?.description).toBe(HOME_PAGE_DESCRIPTION);
  });
});

describe("buildHomePageMetadata", () => {
  it("exports home title template for app router", () => {
    const meta = buildHomePageMetadata();
    expect(meta.description).toBe(HOME_PAGE_DESCRIPTION);
    expect(meta.title).toEqual({
      default: HOME_PAGE_TITLE,
      template: "%s · CyberEdu",
    });
    const twitter = meta.twitter as { card?: string } | undefined;
    expect(twitter?.card).toBe("summary_large_image");
  });
});
