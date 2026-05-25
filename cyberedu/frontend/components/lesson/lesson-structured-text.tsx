import { Fragment } from "react";
import {
  lessonContentArticleClass,
  lessonContentArticleWideClass,
  type LessonContentWidth,
  lessonContentBlockquoteClass,
  lessonContentBodyClass,
  lessonContentCodeWrapClass,
  lessonContentH2Class,
  lessonContentH3Class,
  lessonContentOlClass,
  lessonContentParagraphClass,
  lessonContentTableWrapClass,
  lessonContentUlClass,
} from "@/lib/lesson-content-typography";
import { formatInlineMarkdown } from "@/lib/markdown-inline";
import { type ChecklistItem } from "@/components/learn/learning-checklist";
import { lessonSegmentCalloutVariant } from "@/lib/lesson-callout-variant";
import { LessonFigureBlock } from "@/components/lesson/lesson-figure-block";
import { LessonResourcesBlock } from "@/components/lesson/lesson-resources-block";
import { InfoCard } from "@/components/lesson/lesson-ui/info-card";
import { LessonCallout } from "@/components/lesson/lesson-ui/lesson-callout";
import { TerminalBlock } from "@/components/lesson/lesson-ui/terminal-block";
import type { LessonResourceKind } from "@/lib/lesson-module-media";
import { cn } from "@/lib/utils";

export type GlossaryEntry = { term: string; description: string };

export type LessonSegment =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "def"; title: string; body: string }
  | { type: "ex"; title: string; body: string }
  | { type: "intro"; title: string; body: string }
  | { type: "why"; title: string; body: string }
  | { type: "theory"; title: string; body: string }
  | { type: "warning"; title: string; body: string }
  | { type: "how"; title: string; body: string }
  | { type: "mini_case"; title: string; body: string }
  | { type: "remember"; title: string; body: string }
  | { type: "outro"; title: string; body: string }
  | { type: "terms"; title: string; items: GlossaryEntry[] }
  | { type: "quote"; lines: string[] }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; header: string[]; rows: string[][] }
  | { type: "code"; language: string; body: string }
  | { type: "checklist"; items: ChecklistItem[] }
  | { type: "info"; title: string; body: string }
  | { type: "success"; title: string; body: string }
  | { type: "danger"; title: string; body: string }
  | { type: "tip"; title: string; body: string }
  | { type: "figure"; title: string; src: string; caption: string }
  | {
      type: "resources";
      title: string;
      intro: string;
      items: { title: string; href: string; kind: LessonResourceKind }[];
    };

const FENCE_NAMES = [
  "definition",
  "example",
  "intro",
  "why",
  "theory",
  "warning",
  "how",
  "mini_case",
  "remember",
  "terms",
  "outro",
  "info",
  "success",
  "danger",
  "tip",
] as const;

type FenceName = (typeof FENCE_NAMES)[number];

function isFenceName(s: string): s is FenceName {
  return (FENCE_NAMES as readonly string[]).includes(s);
}

const MEDIA_FENCE_NAMES = ["figure", "resources"] as const;
type MediaFenceName = (typeof MEDIA_FENCE_NAMES)[number];

function isMediaFenceName(s: string): s is MediaFenceName {
  return (MEDIA_FENCE_NAMES as readonly string[]).includes(s);
}

function isAnyFenceName(s: string): boolean {
  return isFenceName(s) || isMediaFenceName(s);
}

const RESOURCE_KINDS = new Set<LessonResourceKind>(["video", "article", "book", "course"]);

function parseResourceKind(raw: string): LessonResourceKind {
  const k = raw.trim().toLowerCase() as LessonResourceKind;
  return RESOURCE_KINDS.has(k) ? k : "article";
}

function parseFigureFence(inner: string): LessonSegment {
  const lines = inner.split("\n").map((l) => l.trim());
  const title = lines[0] ?? "";
  const src = lines[1] ?? "";
  const caption = lines.slice(2).join("\n").trim();
  return { type: "figure", title, src, caption };
}

function parseResourcesFence(inner: string): LessonSegment {
  const lines = inner.split("\n").map((l) => l.trim()).filter(Boolean);
  const title = lines[0] ?? "Дополнительные материалы";
  let intro = "";
  let startIdx = 1;
  if (lines[1] && !/^[-*]\s+/.test(lines[1])) {
    intro = lines[1];
    startIdx = 2;
  }
  const items: { title: string; href: string; kind: LessonResourceKind }[] = [];
  for (let i = startIdx; i < lines.length; i++) {
    const bullet = lines[i].replace(/^[-*]\s+/, "").trim();
    const m = /^\[([^\]]+)\]\(([^)]+)\)\s*\|\s*(\w+)\s*$/.exec(bullet);
    if (m) {
      items.push({
        title: m[1].trim(),
        href: m[2].trim(),
        kind: parseResourceKind(m[3]),
      });
    }
  }
  return { type: "resources", title, intro, items };
}

function parseTableRow(line: string): string[] {
  let inner = line.trim();
  if (inner.startsWith("|")) inner = inner.slice(1);
  if (inner.endsWith("|")) inner = inner.slice(0, -1);
  return inner.split("|").map((c) => c.trim());
}

function isTableSeparator(line: string): boolean {
  const t = line.trim();
  if (!t.includes("|") && !t.includes("-")) return false;
  return /^[\s|:\-]+$/.test(t) && /-{2,}/.test(t);
}

function parseTermsBody(bodyRaw: string, titleLine: string): { title: string; items: GlossaryEntry[] } {
  const lines = bodyRaw.split("\n").map((l) => l.trim()).filter(Boolean);
  const items: GlossaryEntry[] = [];
  for (const line of lines) {
    const bullet = line.replace(/^[-*]\s+/, "").trim();
    if (!bullet) continue;
    const dash = /\s[—–-]\s/.exec(bullet);
    if (dash && dash.index !== undefined && dash.index > 0) {
      const term = bullet.slice(0, dash.index).trim();
      const description = bullet.slice(dash.index + dash[0].length).trim();
      items.push({ term: term || bullet, description: description || "—" });
    } else {
      items.push({ term: bullet, description: "" });
    }
  }
  return { title: titleLine || "Термины", items };
}

function fenceToSegment(kind: FenceName, title: string, body: string): LessonSegment | null {
  switch (kind) {
    case "definition":
      return { type: "def", title: title || "Определение", body: body || title };
    case "example":
      return { type: "ex", title: title || "Пример", body: body || title };
    case "intro":
      return { type: "intro", title: title || "Вступление", body: body || title };
    case "why":
      return { type: "why", title: title || "Зачем это знать", body: body || title };
    case "theory":
      return { type: "theory", title: title || "Теория", body: body || title };
    case "warning":
      return { type: "warning", title: title || "Ошибка новичка", body: body || title };
    case "how":
      return { type: "how", title: title || "Как правильно", body: body || title };
    case "mini_case":
      return { type: "mini_case", title: title || "Мини-кейс", body: body || title };
    case "remember":
      return { type: "remember", title: title || "Запомни", body: body || title };
    case "outro":
      return { type: "outro", title: title || "Итог", body: body || title };
    case "terms": {
      const lines = body.split("\n");
      const first = (lines[0] ?? "").trim();
      const rest = lines.slice(1).join("\n").trim();
      if (rest) {
        const parsed = parseTermsBody(rest, first);
        return { type: "terms", title: parsed.title, items: parsed.items };
      }
      const parsed = parseTermsBody(first, "Термины");
      return { type: "terms", title: parsed.title, items: parsed.items };
    }
    case "info":
      return { type: "info", title: title || "Информация", body: body || title };
    case "success":
      return { type: "success", title: title || "Важно", body: body || title };
    case "danger":
      return { type: "danger", title: title || "Осторожно", body: body || title };
    case "tip":
      return { type: "tip", title: title || "Совет", body: body || title };
    default:
      return null;
  }
}

function readFenceAt(s: string, cursor: number): { segment: LessonSegment | null; end: number } | null {
  if (s[cursor] !== ":") return null;
  const lineEnd = s.indexOf("\n", cursor);
  if (lineEnd === -1) return null;
  const openLine = s.slice(cursor, lineEnd).trim();
  const m = /^:::([a-z_]+)\s*$/.exec(openLine);
  if (!m?.[1] || !isAnyFenceName(m[1])) return null;
  const kind = m[1];
  const start = lineEnd + 1;
  const closeIdx = s.indexOf("\n:::", start);
  if (closeIdx === -1) return null;
  const inner = s.slice(start, closeIdx).trim();
  let segment: LessonSegment | null = null;
  if (kind === "figure") {
    segment = parseFigureFence(inner);
  } else if (kind === "resources") {
    segment = parseResourcesFence(inner);
  } else if (isFenceName(kind)) {
    const lines = inner.split("\n");
    const title = (lines[0] ?? "").trim();
    const body = lines.slice(1).join("\n").trim();
    segment = fenceToSegment(kind, title, body || title || inner);
  }
  let end = closeIdx + "\n:::".length;
  while (end < s.length && s[end] === "\n") end++;
  return { segment, end };
}

function parsePlainBlocks(text: string, out: LessonSegment[]) {
  const parts = text.split(/\n{2,}/);
  for (const raw of parts) {
    const b = raw.trim();
    if (!b) continue;

    const lines = b.split("\n").map((l) => l.trimEnd());
    const nonEmpty = lines.filter((l) => l.length > 0);
    if (nonEmpty.length > 0 && nonEmpty.every((l) => l.startsWith(">"))) {
      out.push({
        type: "quote",
        lines: nonEmpty.map((l) => l.replace(/^>\s?/, "").trim()),
      });
      continue;
    }

    if (nonEmpty.length > 0 && nonEmpty.every((l) => /^- \[[ xX]\]\s+/.test(l))) {
      out.push({
        type: "checklist",
        items: nonEmpty.map((l) => {
          const m = /^- \[([ xX])\]\s+(.+)$/.exec(l);
          return { checked: m?.[1]?.toLowerCase() === "x", text: m?.[2]?.trim() ?? l };
        }),
      });
      continue;
    }

    if (nonEmpty.length > 0 && nonEmpty.every((l) => /^[-*]\s+/.test(l))) {
      out.push({
        type: "ul",
        items: nonEmpty.map((l) => l.replace(/^[-*]\s+/, "").trim()),
      });
      continue;
    }

    if (nonEmpty.length > 0 && nonEmpty.every((l) => /^\d+[.)]\s+/.test(l))) {
      out.push({
        type: "ol",
        items: nonEmpty.map((l) => l.replace(/^\d+[.)]\s+/, "").trim()),
      });
      continue;
    }

    if (
      nonEmpty.length >= 2 &&
      nonEmpty.every((l) => l.includes("|")) &&
      isTableSeparator(nonEmpty[1] ?? "")
    ) {
      const header = parseTableRow(nonEmpty[0] ?? "");
      const rows = nonEmpty.slice(2).map(parseTableRow).filter((row) => row.some((c) => c.length > 0));
      if (header.length > 0) {
        out.push({ type: "table", header, rows });
        continue;
      }
    }

    if (b.startsWith("```")) {
      const lines = b.split("\n");
      const lang = lines[0]?.slice(3).trim() ?? "";
      const end = lines[lines.length - 1]?.trim() === "```" ? lines.length - 1 : lines.length;
      const codeBody = lines.slice(1, end).join("\n");
      out.push({ type: "code", language: lang, body: codeBody });
      continue;
    }

    if (b.startsWith("### ")) {
      out.push({ type: "h3", text: b.slice(4).trim() });
      continue;
    }
    if (b.startsWith("## ") && !b.startsWith("### ")) {
      out.push({ type: "h2", text: b.slice(3).trim() });
      continue;
    }
    if (b.startsWith("# ")) {
      out.push({ type: "h2", text: b.slice(2).trim() });
      continue;
    }

    out.push({ type: "p", text: b });
  }
}

/** Разбор текста лекции: заголовки, списки, цитаты, блоки :::kind … :::. */
export function parseLessonStructure(source: string): LessonSegment[] {
  const out: LessonSegment[] = [];
  const s = source.replace(/\r\n/g, "\n");
  let cursor = 0;

  while (cursor < s.length) {
    if (s[cursor] === "\n") {
      cursor++;
      continue;
    }

    const fence = readFenceAt(s, cursor);
    if (fence?.segment) {
      out.push(fence.segment);
      cursor = fence.end;
      continue;
    }

    const nextFence = (() => {
      let best = -1;
      for (let i = cursor; i < s.length; i++) {
        if (s[i] !== ":" || s[i + 1] !== ":" || s[i + 2] !== ":") continue;
        const lineEnd = s.indexOf("\n", i);
        if (lineEnd === -1) break;
        const line = s.slice(i, lineEnd).trim();
        const m = /^:::([a-z_]+)\s*$/.exec(line);
        if (m?.[1] && isAnyFenceName(m[1])) {
          best = i;
          break;
        }
      }
      return best;
    })();

    if (nextFence === -1) {
      parsePlainBlocks(s.slice(cursor), out);
      break;
    }

    if (nextFence > cursor) {
      parsePlainBlocks(s.slice(cursor, nextFence), out);
      cursor = nextFence;
      continue;
    }

    cursor += 1;
  }

  return out;
}

/** Термины из блоков :::definition и :::terms для боковой панели. */
export function extractLessonGlossary(source: string): GlossaryEntry[] {
  const segments = parseLessonStructure(source);
  const seen = new Set<string>();
  const list: GlossaryEntry[] = [];
  for (const seg of segments) {
    if (seg.type === "def") {
      const key = seg.title.trim().toLowerCase();
      if (key && !seen.has(key)) {
        seen.add(key);
        list.push({ term: seg.title.trim(), description: seg.body.trim() });
      }
    }
    if (seg.type === "terms") {
      for (const it of seg.items) {
        const key = it.term.trim().toLowerCase();
        if (!key || seen.has(key)) continue;
        seen.add(key);
        list.push({
          term: it.term.trim(),
          description: it.description.trim() || "—",
        });
      }
    }
  }
  return list;
}

function renderInlineText(text: string) {
  const lines = text.split("\n");
  if (lines.length === 1) return formatInlineMarkdown(text);
  return lines.map((ln, j) => (
    <Fragment key={j}>
      {j > 0 ? <br /> : null}
      {formatInlineMarkdown(ln)}
    </Fragment>
  ));
}

type LessonSegmentType = LessonSegment["type"];

const CALLOUT_SEGMENT_TYPES = new Set<LessonSegmentType>([
  "ex",
  "intro",
  "why",
  "warning",
  "how",
  "mini_case",
  "remember",
  "outro",
  "info",
  "success",
  "danger",
  "tip",
  "checklist",
]);

type LessonCalloutBodySegment = Extract<
  LessonSegment,
  { title: string; body: string }
>;

function renderLessonCallout(
  seg: LessonCalloutBodySegment | Extract<LessonSegment, { type: "checklist" }>,
  key: number,
  anchor: { id: string; className: string } | null,
) {
  const variant = lessonSegmentCalloutVariant(seg);
  if (!variant) return null;

  if (seg.type === "checklist") {
    return (
      <LessonCallout
        key={key}
        type="checklist"
        id={anchor?.id}
        items={seg.items.map((item) => ({
          checked: item.checked,
          text: renderInlineText(item.text),
        }))}
      />
    );
  }

  return (
    <LessonCallout key={key} type={variant} id={anchor?.id} title={seg.title}>
      <p className="whitespace-pre-wrap">{renderInlineText(seg.body)}</p>
    </LessonCallout>
  );
}

const NAV_SEGMENT_TYPES = new Set<LessonSegmentType>([
  "h2",
  "h3",
  "theory",
  "ex",
  "warning",
  "intro",
  "why",
  "how",
  "mini_case",
  "remember",
  "tip",
  "def",
  "outro",
]);

function lessonSectionId(navIndex: number, label: string): string {
  const slug = label
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04ff]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `ls-${navIndex}-${slug || "block"}`;
}

function getSegmentNavLabel(seg: LessonSegment): string {
  switch (seg.type) {
    case "h2":
    case "h3":
      return seg.text.trim() || "Раздел";
    default:
      if ("title" in seg && seg.title.trim()) return seg.title.trim();
      return seg.type;
  }
}

function sectionAnchorProps(navIndex: number, label: string): { id: string; className: string } {
  const id = lessonSectionId(navIndex, label);
  return { id, className: "scroll-mt-28" };
}

export function LessonStructuredText({
  source,
  className,
  width = "reading",
  skipTypes = [],
}: {
  source: string;
  className?: string;
  width?: LessonContentWidth;
  /** Не рендерить блоки (например mini_case — показывается отдельной карточкой) */
  skipTypes?: LessonSegmentType[];
}) {
  const segments = parseLessonStructure(source);
  const skip = new Set(skipTypes);
  let navIndex = 0;

  return (
    <article
      className={cn(
        width === "wide" ? lessonContentArticleWideClass : lessonContentArticleClass,
        lessonContentBodyClass,
        className,
      )}
      aria-label="Текст лекции"
    >
      {segments.map((seg, i) => {
        if (skip.has(seg.type)) return null;
        const inNav = NAV_SEGMENT_TYPES.has(seg.type);
        const anchor = inNav ? sectionAnchorProps(navIndex++, getSegmentNavLabel(seg)) : null;
        switch (seg.type) {
          case "h2":
            return (
              <h2
                key={i}
                {...(anchor ? { id: anchor.id } : {})}
                className={cn(anchor?.className, lessonContentH2Class)}
              >
                {renderInlineText(seg.text)}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={i}
                {...(anchor ? { id: anchor.id } : {})}
                className={cn(anchor?.className, lessonContentH3Class)}
              >
                {renderInlineText(seg.text)}
              </h3>
            );
          case "p":
            return (
              <p key={i} className={lessonContentParagraphClass}>
                {renderInlineText(seg.text)}
              </p>
            );
          case "def":
            return (
              <InfoCard key={i} id={anchor?.id} title={seg.title} label="Термин">
                <p className="whitespace-pre-wrap">{renderInlineText(seg.body)}</p>
              </InfoCard>
            );
          case "ex":
          case "intro":
          case "why":
          case "warning":
          case "how":
          case "mini_case":
          case "remember":
          case "outro":
          case "info":
          case "success":
          case "danger":
          case "tip":
          case "checklist":
            return CALLOUT_SEGMENT_TYPES.has(seg.type)
              ? renderLessonCallout(
                  seg as LessonCalloutBodySegment | Extract<LessonSegment, { type: "checklist" }>,
                  i,
                  anchor,
                )
              : null;
          case "theory":
            return (
              <InfoCard key={i} id={anchor?.id} title={seg.title} label="Теория" variant="accent">
                <p className="whitespace-pre-wrap text-foreground/90">{renderInlineText(seg.body)}</p>
              </InfoCard>
            );
          case "code":
            return (
              <div key={i} className={lessonContentCodeWrapClass} role="group" aria-label="Блок кода">
                <TerminalBlock language={seg.language || undefined} code={seg.body} className="min-w-0 w-full" />
              </div>
            );
          case "terms":
            return (
              <section
                key={i}
                className="rounded-2xl border border-border/80 bg-muted/25 px-5 py-4 ring-1 ring-inset ring-border/50"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{seg.title}</p>
                <dl className="mt-3 space-y-3">
                  {seg.items.map((it, j) => (
                    <div key={j} className="border-b border-border/50 pb-3 last:border-0 last:pb-0">
                      <dt className="font-semibold text-foreground">{renderInlineText(it.term)}</dt>
                      {it.description ? (
                        <dd className="mt-1 text-[15px] leading-relaxed text-muted-foreground">{renderInlineText(it.description)}</dd>
                      ) : null}
                    </div>
                  ))}
                </dl>
              </section>
            );
          case "quote":
            return (
              <blockquote key={i} className={lessonContentBlockquoteClass}>
                {seg.lines.map((line, j) => (
                  <p key={j} className={j ? "mt-2 whitespace-pre-wrap" : "whitespace-pre-wrap"}>
                    {renderInlineText(line)}
                  </p>
                ))}
              </blockquote>
            );
          case "ul":
            return (
              <ul key={i} className={lessonContentUlClass}>
                {seg.items.map((item, j) => (
                  <li key={j} className="pl-1 text-pretty">
                    {renderInlineText(item)}
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className={lessonContentOlClass}>
                {seg.items.map((item, j) => (
                  <li key={j} className="pl-1 text-pretty">
                    {renderInlineText(item)}
                  </li>
                ))}
              </ol>
            );
          case "table":
            return (
              <div
                key={i}
                className={lessonContentTableWrapClass}
                role="region"
                aria-label="Таблица"
                tabIndex={0}
              >
                <table className="w-full min-w-[20rem] border-collapse text-left text-sm sm:min-w-[24rem]">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {seg.header.map((cell, j) => (
                        <th key={j} scope="col" className="px-3 py-2.5 font-semibold text-foreground">
                          {renderInlineText(cell)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {seg.rows.map((row, ri) => (
                      <tr key={ri} className="border-b border-border/60 last:border-0 even:bg-muted/15">
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-3 py-2.5 align-top text-foreground/90">
                            {renderInlineText(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "figure":
            return (
              <LessonFigureBlock
                key={i}
                id={anchor?.id}
                title={seg.title}
                src={seg.src}
                caption={seg.caption}
                className={anchor?.className}
              />
            );
          case "resources":
            return (
              <LessonResourcesBlock
                key={i}
                id={anchor?.id}
                title={seg.title}
                intro={seg.intro}
                items={seg.items}
                className={anchor?.className}
              />
            );
          default:
            return null;
        }
      })}
    </article>
  );
}
