import { type ReactNode } from "react";
import { lessonContentInlineCodeClass } from "@/lib/lesson-content-typography";
import { safeLessonHref, safeLessonImageSrc } from "@/lib/safe-lesson-url";
import { cn } from "@/lib/utils";

/** Порядок: image, bold+italic, bold, italic (без lookbehind), code, link. */
const INLINE_PATTERN =
  /(!\[[^\]]*\]\([^)]+\)|\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(\S[^*]*?)\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

const linkFocus =
  "rounded-sm text-primary underline decoration-primary/40 underline-offset-[3px] transition-colors hover:text-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Убирает маркеры заголовка (#…######), если модель вставила их внутри строки. */
export function stripInlineHeadingMarkers(text: string): string {
  return text.replace(/^#{1,6}\s+/, "");
}

/** Снимает непарные `**`, чтобы не светились в UI. */
export function normalizeUnpairedBoldMarkers(text: string): string {
  const count = (text.match(/\*\*/g) ?? []).length;
  if (count % 2 === 1) {
    return text.replace(/\*\*/g, "");
  }
  return text;
}

/** Удаляет оставшиеся `*` / `**` после разбора разметки. */
export function stripResidualMarkdownAsterisks(text: string): string {
  return text.replace(/\*+/g, "");
}

function prepareInlineMarkdown(text: string): string {
  return normalizeUnpairedBoldMarkers(stripInlineHeadingMarkers(text));
}

/** Инлайн Markdown: **жирный**, *курсив*, `код`, [ссылки](url), ![alt](src). Без сырого HTML. */
export function formatInlineMarkdown(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const normalized = prepareInlineMarkdown(text);
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;

  while ((m = INLINE_PATTERN.exec(normalized)) !== null) {
    if (m.index > last) {
      parts.push(stripResidualMarkdownAsterisks(normalized.slice(last, m.index)));
    }
    const token = m[0];

    if (token.startsWith("***")) {
      const inner = m[1] ?? "";
      parts.push(
        <strong key={k++} className="font-semibold text-foreground">
          <em className="italic">{stripInlineHeadingMarkers(inner)}</em>
        </strong>,
      );
    } else if (token.startsWith("**")) {
      const inner = m[2] ?? "";
      parts.push(
        <strong key={k++} className="font-semibold text-foreground">
          {stripInlineHeadingMarkers(inner)}
        </strong>,
      );
    } else if (token.startsWith("*")) {
      const inner = m[3] ?? "";
      parts.push(
        <em key={k++} className="italic text-foreground/95">
          {inner}
        </em>,
      );
    } else if (token.startsWith("`")) {
      parts.push(
        <code key={k++} className={lessonContentInlineCodeClass}>
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("![")) {
      const img = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(token);
      if (img) {
        const alt = img[1]?.trim() ?? "";
        const src = safeLessonImageSrc(img[2] ?? "");
        if (src) {
          parts.push(
            <span key={k++} className="my-4 block">
              {/* eslint-disable-next-line @next/next/no-img-element -- внешние URL из контента курса */}
              <img
                src={src}
                alt={alt || "Иллюстрация к уроку"}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className={cn(
                  "max-h-[min(28rem,70vh)] w-full max-w-full rounded-xl border border-border/80",
                  "bg-muted/20 object-contain shadow-sm",
                )}
              />
              {alt ? (
                <span className="mt-2 block text-center text-xs text-muted-foreground">{alt}</span>
              ) : null}
            </span>,
          );
        } else if (alt) {
          parts.push(<span key={k++} className="text-muted-foreground">{alt}</span>);
        }
      } else {
        parts.push(stripResidualMarkdownAsterisks(token));
      }
    } else {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (link) {
        const href = safeLessonHref(link[2] ?? "");
        const label = link[1];
        if (href) {
          const external = href.startsWith("http");
          parts.push(
            <a
              key={k++}
              href={href}
              className={linkFocus}
              rel={external ? "noopener noreferrer" : undefined}
              target={external ? "_blank" : undefined}
            >
              {label}
            </a>,
          );
        } else {
          parts.push(label);
        }
      } else {
        parts.push(stripResidualMarkdownAsterisks(token));
      }
    }
    last = m.index + token.length;
  }

  if (last < normalized.length) {
    parts.push(stripResidualMarkdownAsterisks(normalized.slice(last)));
  }
  return parts.length ? parts : [stripResidualMarkdownAsterisks(normalized)];
}
