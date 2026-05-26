"use client";

import { Fragment } from "react";
import { CodeBlock } from "@/components/ai/mentor/code-block";
import { formatInlineMarkdown } from "@/lib/markdown-inline";
import { cn } from "@/lib/utils";

type Block =
  | { type: "code"; lang: string; body: string }
  | { type: "h"; level: 1 | 2 | 3; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "p"; text: string }
  | { type: "hr" };

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (/^```/.test(line)) {
      const lang = line.slice(3).trim();
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        body.push(lines[i]);
        i++;
      }
      blocks.push({ type: "code", lang, body: body.join("\n") });
      i++;
      continue;
    }
    if (/^---+$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }
    const h = /^(#{1,3})\s+(.+)$/.exec(line);
    if (h) {
      blocks.push({ type: "h", level: h[1].length as 1 | 2 | 3, text: h[2].trim() });
      i++;
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }
    if (line.trim() === "") {
      i++;
      continue;
    }
    const para: string[] = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== "" && !/^#{1,3}\s/.test(lines[i]) && !/^```/.test(lines[i]) && !/^[-*]\s+/.test(lines[i]) && !/^\d+\.\s+/.test(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    blocks.push({ type: "p", text: para.join("\n") });
  }
  return blocks;
}

export function MentorMarkdown({
  source,
  className,
  compact = false,
}: {
  source: string;
  className?: string;
  compact?: boolean;
}) {
  const blocks = parseBlocks(source.trim());
  if (!blocks.length) return null;

  return (
    <div
      className={cn(
        "ce-mentor-md min-w-0 text-foreground/95",
        compact ? "space-y-1.5 text-xs leading-relaxed" : "space-y-2 text-sm leading-relaxed",
        className,
      )}
    >
      {blocks.map((b, idx) => {
        switch (b.type) {
          case "code":
            return <CodeBlock key={idx} language={b.lang || undefined} code={b.body} />;
          case "h":
            if (b.level === 1) {
              return (
                <h3
                  key={idx}
                  className={cn(
                    "font-semibold tracking-tight text-foreground first:mt-0",
                    compact ? "mt-2 text-sm" : "mt-3 text-base",
                  )}
                >
                  {formatInlineMarkdown(b.text)}
                </h3>
              );
            }
            if (b.level === 2) {
              return (
                <h4
                  key={idx}
                  className={cn(
                    "font-semibold text-foreground first:mt-0",
                    compact ? "mt-1.5 text-xs" : "mt-2.5 text-sm",
                  )}
                >
                  {formatInlineMarkdown(b.text)}
                </h4>
              );
            }
            return (
              <h5
                key={idx}
                className={cn(
                  "font-semibold uppercase tracking-wide text-muted-foreground first:mt-0",
                  compact ? "mt-1 text-2.5" : "mt-2 text-xs",
                )}
              >
                {formatInlineMarkdown(b.text)}
              </h5>
            );
          case "ul":
            return (
              <ul
                key={idx}
                className={cn("ml-4 list-disc text-foreground/90", compact ? "space-y-0.5" : "space-y-1")}
              >
                {b.items.map((item, j) => (
                  <li key={j} className="pl-0.5">
                    {formatInlineMarkdown(item)}
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol
                key={idx}
                className={cn("ml-4 list-decimal text-foreground/90", compact ? "space-y-0.5" : "space-y-1")}
              >
                {b.items.map((item, j) => (
                  <li key={j} className="pl-0.5">
                    {formatInlineMarkdown(item)}
                  </li>
                ))}
              </ol>
            );
          case "hr":
            return <hr key={idx} className="my-3 border-cyan/15" />;
          case "p":
            return (
              <p key={idx} className="whitespace-pre-wrap">
                {b.text.split("\n").map((ln, j) => (
                  <Fragment key={j}>
                    {j > 0 ? <br /> : null}
                    {formatInlineMarkdown(ln)}
                  </Fragment>
                ))}
              </p>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
