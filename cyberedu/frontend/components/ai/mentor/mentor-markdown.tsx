"use client";

import { Fragment, type ReactNode } from "react";
import { CodeBlock } from "@/components/ai/mentor/code-block";
import { cn } from "@/lib/utils";

function inlineFormat(text: string): ReactNode[] {
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
        <code key={k++} className="rounded bg-cyan/10 px-1 py-0.5 font-mono text-[0.85em] text-cyan">
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (link) {
        parts.push(
          <a key={k++} href={link[2]} className="text-cyan underline-offset-2 hover:underline" rel="noopener noreferrer" target="_blank">
            {link[1]}
          </a>,
        );
      } else {
        parts.push(token);
      }
    }
    last = m.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : [text];
}

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

export function MentorMarkdown({ source, className }: { source: string; className?: string }) {
  const blocks = parseBlocks(source.trim());
  if (!blocks.length) return null;

  return (
    <div className={cn("ce-mentor-md space-y-2 text-sm leading-relaxed text-foreground/95", className)}>
      {blocks.map((b, idx) => {
        switch (b.type) {
          case "code":
            return <CodeBlock key={idx} language={b.lang || undefined} code={b.body} />;
          case "h":
            if (b.level === 1) {
              return (
                <h3 key={idx} className="mt-3 text-base font-semibold tracking-tight text-foreground first:mt-0">
                  {inlineFormat(b.text)}
                </h3>
              );
            }
            if (b.level === 2) {
              return (
                <h4 key={idx} className="mt-2.5 text-sm font-semibold text-foreground first:mt-0">
                  {inlineFormat(b.text)}
                </h4>
              );
            }
            return (
              <h5 key={idx} className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground first:mt-0">
                {inlineFormat(b.text)}
              </h5>
            );
          case "ul":
            return (
              <ul key={idx} className="ml-4 list-disc space-y-1 text-foreground/90">
                {b.items.map((item, j) => (
                  <li key={j}>{inlineFormat(item)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={idx} className="ml-4 list-decimal space-y-1 text-foreground/90">
                {b.items.map((item, j) => (
                  <li key={j}>{inlineFormat(item)}</li>
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
                    {inlineFormat(ln)}
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
