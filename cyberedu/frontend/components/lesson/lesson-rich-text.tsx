import { formatInlineMarkdown } from "@/lib/markdown-inline";

/** Упрощённый рендер: блоки по пустым строкам, заголовки `#` / `##`, остальное — абзац с переносами. */
export function LessonRichText({ source }: { source: string }) {
  const blocks = source.split(/\n{2,}/);
  return (
    <article className="max-w-none space-y-4 text-base leading-relaxed text-card-foreground">
      {blocks.map((raw, i) => {
        const b = raw.trim();
        if (!b) return null;
        if (b.startsWith("## ") && !b.startsWith("### ")) {
          return (
            <h3 key={i} className="text-lg font-semibold tracking-tight text-foreground">
              {formatInlineMarkdown(b.slice(3))}
            </h3>
          );
        }
        if (b.startsWith("# ")) {
          return (
            <h2 key={i} className="text-xl font-semibold tracking-tight text-foreground">
              {formatInlineMarkdown(b.slice(2))}
            </h2>
          );
        }
        return (
          <p key={i} className="whitespace-pre-wrap text-pretty">
            {formatInlineMarkdown(b)}
          </p>
        );
      })}
    </article>
  );
}
