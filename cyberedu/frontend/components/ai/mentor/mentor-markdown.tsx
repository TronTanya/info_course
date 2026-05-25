"use client";

import { Fragment } from "react";
import { Lightbulb, ListOrdered, Sparkles } from "lucide-react";
import { CodeBlock } from "@/components/ai/mentor/code-block";
import { formatInlineMarkdown } from "@/lib/markdown-inline";
import {
  calloutKindFromText,
  isMentorCalloutLine,
  structureMentorReply,
} from "@/lib/mentor-markdown-structure";
import { cn } from "@/lib/utils";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type Block =
  | { type: "code"; lang: string; body: string }
  | { type: "h"; level: HeadingLevel; text: string }
  | { type: "callout"; kind: "analogy" | "tip" | "note"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "p"; text: string; lead?: boolean }
  | { type: "hr" };

const HEADING_LINE = /^(#{1,6})\s+(.+)$/;
const HEADING_LINE_START = /^#{1,6}\s/;

/** Убирает обёртку **…** вокруг строки-заголовка. */
export function normalizeMentorMarkdownSource(source: string): string {
  return source.replace(/\*\*(#{1,6}\s+[^*]+)\*\*/g, "$1");
}

function parseBlocks(source: string): Block[] {
  const lines = source.split("\n");
  const blocks: Block[] = [];
  let i = 0;
  let sawContent = false;

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
      sawContent = true;
      continue;
    }
    if (/^---+$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }
    const h = HEADING_LINE.exec(line);
    if (h) {
      const level = Math.min(h[1].length, 6) as HeadingLevel;
      blocks.push({ type: "h", level, text: h[2].trim() });
      i++;
      sawContent = true;
      continue;
    }
    if (/^>\s+/.test(line) || isMentorCalloutLine(line)) {
      const parts: string[] = [];
      while (i < lines.length && (/^>\s+/.test(lines[i]) || isMentorCalloutLine(lines[i]))) {
        parts.push(lines[i].replace(/^>\s+/, "").trim());
        i++;
      }
      const text = parts.join("\n");
      blocks.push({ type: "callout", kind: calloutKindFromText(text), text });
      sawContent = true;
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      sawContent = true;
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      sawContent = true;
      continue;
    }
    if (line.trim() === "") {
      i++;
      continue;
    }
    const para: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !HEADING_LINE_START.test(lines[i]) &&
      !/^```/.test(lines[i]) &&
      !/^>\s+/.test(lines[i]) &&
      !isMentorCalloutLine(lines[i]) &&
      !/^[-*]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push({ type: "p", text: para.join("\n"), lead: !sawContent });
    sawContent = true;
  }
  return blocks;
}

function CalloutBlock({
  kind,
  text,
  compact,
}: {
  kind: "analogy" | "tip" | "note";
  text: string;
  compact?: boolean;
}) {
  const Icon = kind === "analogy" ? Lightbulb : kind === "tip" ? Sparkles : ListOrdered;
  const label =
    kind === "analogy" ? "Аналогия" : kind === "tip" ? "Важно" : "Заметка";

  return (
    <aside
      className={cn(
        "ce-mentor-callout rounded-xl border px-3 py-2.5",
        kind === "analogy" && "ce-mentor-callout--analogy",
        kind === "tip" && "ce-mentor-callout--tip",
        kind === "note" && "ce-mentor-callout--note",
        compact ? "text-xs" : "text-sm",
      )}
    >
      <p className="mb-1 flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-cyan">
        <Icon className="size-3 shrink-0" aria-hidden />
        {label}
      </p>
      <div className="leading-relaxed text-pretty text-foreground/95">
        {text.split("\n").map((ln, j) => (
          <Fragment key={j}>
            {j > 0 ? <br /> : null}
            {formatInlineMarkdown(ln.replace(/^(аналогия|пример|важно)\s*:\s*/i, ""))}
          </Fragment>
        ))}
      </div>
    </aside>
  );
}

function SectionHeading({
  level,
  text,
  compact,
  prose,
}: {
  level: HeadingLevel;
  text: string;
  compact?: boolean;
  prose?: boolean;
}) {
  const isOutlineTitle = /конспект/i.test(text);
  const isNumbered = /^\d+\.\s/.test(text);

  const headingClass = cn(
    "font-display font-semibold tracking-tight text-foreground first:mt-0",
    isOutlineTitle &&
      prose &&
      "ce-mentor-md-outline-title text-base sm:text-lg",
    isNumbered &&
      prose &&
      "ce-mentor-md-section-title mt-4 flex items-baseline gap-2 text-sm sm:text-base",
    !isOutlineTitle &&
      !isNumbered &&
      (compact ? "mt-2 text-sm" : prose ? "mt-3 text-base" : "mt-3 text-base"),
    level >= 4 && !isNumbered && "text-muted-foreground",
  );

  if (isNumbered && prose) {
    const m = /^(\d+)\.\s*(.*)$/.exec(text);
    const num = m?.[1] ?? "";
    const title = m?.[2] ?? text;
    return (
      <h4 className={headingClass}>
        <span
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-lg border border-cyan/35 bg-cyan/12 font-mono text-[11px] font-bold tabular-nums text-cyan"
          aria-hidden
        >
          {num}
        </span>
        <span className="min-w-0">{formatInlineMarkdown(title)}</span>
      </h4>
    );
  }

  const Tag = level <= 2 ? "h3" : level === 3 ? "h4" : "h5";
  return (
    <Tag className={headingClass}>
      {formatInlineMarkdown(text)}
    </Tag>
  );
}

export function MentorMarkdown({
  source,
  className,
  compact = false,
  prose = false,
}: {
  source: string;
  className?: string;
  compact?: boolean;
  prose?: boolean;
}) {
  const prepared = structureMentorReply(normalizeMentorMarkdownSource(source)).trim();
  const blocks = parseBlocks(prepared);
  if (!blocks.length) return null;

  const rich = prose && !compact;

  return (
    <div
      className={cn(
        "ce-mentor-md min-w-0",
        compact ? "space-y-1.5 text-xs leading-relaxed" : "space-y-2.5 text-sm leading-relaxed",
        rich && "ce-mentor-md--prose max-w-none space-y-3",
        className,
      )}
    >
      {blocks.map((b, idx) => {
        switch (b.type) {
          case "code":
            return <CodeBlock key={idx} language={b.lang || undefined} code={b.body} />;
          case "h":
            return (
              <SectionHeading
                key={idx}
                level={b.level}
                text={b.text}
                compact={compact}
                prose={prose}
              />
            );
          case "callout":
            return <CalloutBlock key={idx} kind={b.kind} text={b.text} compact={compact} />;
          case "ul":
            return (
              <ul
                key={idx}
                className={cn(
                  "ce-mentor-md-list space-y-1.5",
                  rich ? "ml-0 list-none pl-0" : "ml-4 list-disc",
                )}
              >
                {b.items.map((item, j) => (
                  <li
                    key={j}
                    className={cn(
                      rich && "relative rounded-lg border border-border/50 bg-muted/15 px-3 py-2 pl-3",
                      rich &&
                        "before:absolute before:left-0 before:top-3 before:h-1.5 before:w-1 before:rounded-full before:bg-cyan/70",
                    )}
                  >
                    {formatInlineMarkdown(item)}
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol
                key={idx}
                className={cn(
                  "ce-mentor-md-sections",
                  rich ? "list-none space-y-3 pl-0" : "ml-4 list-decimal space-y-1",
                )}
              >
                {b.items.map((item, j) => (
                  <li
                    key={j}
                    className={cn(
                      rich &&
                        "rounded-xl border border-border/60 bg-gradient-to-br from-card to-muted/20 p-3 shadow-sm",
                    )}
                  >
                    {rich ? (
                      <p className="flex gap-2 font-display text-sm font-semibold text-foreground">
                        <span
                          className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-cyan/30 bg-cyan/10 font-mono text-[11px] font-bold text-cyan"
                          aria-hidden
                        >
                          {j + 1}
                        </span>
                        <span className="min-w-0 pt-0.5 leading-snug">{formatInlineMarkdown(item)}</span>
                      </p>
                    ) : (
                      formatInlineMarkdown(item)
                    )}
                  </li>
                ))}
              </ol>
            );
          case "hr":
            return <hr key={idx} className="my-3 border-cyan/15" />;
          case "p":
            return (
              <p
                key={idx}
                className={cn(
                  "whitespace-pre-wrap text-pretty",
                  b.lead && rich && "ce-mentor-md-lead text-[15px] leading-relaxed text-foreground/90",
                  !b.lead && rich && "text-foreground/90",
                )}
              >
                {b.text.split("\n").map((ln, j) => {
                  const line = ln.replace(/^#{1,6}\s+/, "");
                  return (
                    <Fragment key={j}>
                      {j > 0 ? <br /> : null}
                      {formatInlineMarkdown(line)}
                    </Fragment>
                  );
                })}
              </p>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
