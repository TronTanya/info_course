/**
 * Безопасные href/src для учебного контента (admin-authored, но без javascript: и data:).
 */
export function safeLessonHref(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
  } catch {
    return null;
  }
  return null;
}

export function safeLessonImageSrc(raw: string): string | null {
  return safeLessonHref(raw);
}
