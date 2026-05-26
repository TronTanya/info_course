import { type ReactNode } from "react";
import { isSafeMarkdownHref } from "@/lib/security/sanitize";

/** Инлайн Markdown: **жирный**, `код`, [ссылки](url). */
export function formatInlineMarkdown(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith("**")) {
      parts.push(
        <strong key={k++} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`")) {
      parts.push(
        <code key={k++} className="rounded bg-primary/10 px-1 py-0.5 font-mono text-[0.9em] text-primary">
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (link) {
        const label = link[1];
        const href = link[2];
        if (isSafeMarkdownHref(href)) {
          parts.push(
            <a
              key={k++}
              href={href}
              className="text-primary underline-offset-2 hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              {label}
            </a>,
          );
        } else {
          parts.push(
            <span key={k++} className="text-foreground">
              {label}
            </span>,
          );
        }
      } else {
        parts.push(token);
      }
    }
    last = m.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : [text];
}
