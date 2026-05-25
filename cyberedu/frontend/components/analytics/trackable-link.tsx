"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import type { AnalyticsEventName } from "@/lib/analytics/events";
import { focusRing } from "@/lib/design-system/primitives";
import { parseLearnHrefIds, type SafeAnalyticsProps } from "@/lib/analytics/payload";
import { trackAnalyticsEvent } from "@/lib/analytics/track";
import { cn } from "@/lib/utils";

type TrackableLinkProps = ComponentProps<typeof Link> & {
  event: AnalyticsEventName;
  analytics?: SafeAnalyticsProps;
};

function hrefToPath(href: ComponentProps<typeof Link>["href"]): string {
  if (typeof href === "string") return href;
  if (href && typeof href === "object" && "pathname" in href && typeof href.pathname === "string") {
    return href.pathname;
  }
  return "";
}

/** Link с безопасным UI-событием по клику (без содержимого ответов и PII). */
export function TrackableLink({ event, analytics, href, onClick, className, ...rest }: TrackableLinkProps) {
  const hrefStr = hrefToPath(href);

  return (
    <Link
      href={href}
      className={cn(focusRing, "rounded-2xl", className)}
      {...rest}
      onClick={(e) => {
        const fromHref = parseLearnHrefIds(hrefStr);
        trackAnalyticsEvent(event, { ...fromHref, ...analytics });
        onClick?.(e);
      }}
    />
  );
}
