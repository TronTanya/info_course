import { Fragment, type ReactNode } from "react";
import { LearningCallout } from "@/components/learn/learning-callout";
import { formatInlineMarkdown } from "@/lib/markdown-inline";
import { type ChecklistItem } from "@/components/learn/learning-checklist";
import { Checklist } from "@/components/lesson/lesson-ui/checklist";
import { InfoCard } from "@/components/lesson/lesson-ui/info-card";
import { TerminalBlock } from "@/components/lesson/lesson-ui/terminal-block";
import { WarningCard } from "@/components/lesson/lesson-ui/warning-card";
import { cn } from "@/lib/utils";

export type GlossaryEntry = { term: string; description: string };

type Segment =
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
  | { type: "table"; header: string[]; rows: string[][] }
  | { type: "code"; language: string; body: string }
  | { type: "checklist"; items: ChecklistItem[] }
  | { type: "info"; title: string; body: string }
  | { type: "success"; title: string; body: string }
  | { type: "danger"; title: string; body: string };

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
] as const;

type FenceName = (typeof FENCE_NAMES)[number];

function isFenceName(s: string): s is FenceName {
  return (FENCE_NAMES as readonly string[]).includes(s);
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

function fenceToSegment(kind: FenceName, title: string, body: string): Segment | null {
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
    default:
      return null;
  }
}

function readFenceAt(s: string, cursor: number): { segment: Segment | null; end: number } | null {
  if (s[cursor] !== ":") return null;
  const lineEnd = s.indexOf("\n", cursor);
  if (lineEnd === -1) return null;
  const openLine = s.slice(cursor, lineEnd).trim();
  const m = /^:::([a-z_]+)\s*$/.exec(openLine);
  if (!m?.[1] || !isFenceName(m[1])) return null;
  const kind = m[1];
  const start = lineEnd + 1;
  const closeIdx = s.indexOf("\n:::", start);
  if (closeIdx === -1) return null;
  const inner = s.slice(start, closeIdx).trim();
  const lines = inner.split("\n");
  const title = (lines[0] ?? "").trim();
  const body = lines.slice(1).join("\n").trim();
  const segment = fenceToSegment(kind, title, body || title || inner);
  let end = closeIdx + "\n:::".length;
  while (end < s.length && s[end] === "\n") end++;
  return { segment, end };
}

function parsePlainBlocks(text: string, out: Segment[]) {
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
      out.push({ type: "h3", text: b.slice(3).trim() });
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
export function parseLessonStructure(source: string): Segment[] {
  const out: Segment[] = [];
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
        if (m?.[1] && isFenceName(m[1])) {
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

const prose =
  "text-lg leading-7 tracking-tight text-foreground/95 [&_p+p]:mt-4 [&_h2+p]:mt-3 [&_h3+p]:mt-2";

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

function BlockShell({
  className,
  label,
  labelClass,
  title,
  children,
}: {
  className?: string;
  label: string;
  labelClass: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl px-5 py-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]",
        className,
      )}
    >
      <p className={cn("text-xs font-semibold uppercase tracking-wide", labelClass)}>{label}</p>
      {title ? (
        <h3 className="mt-1 text-base font-semibold tracking-tight text-foreground">{title}</h3>
      ) : null}
      <div className="mt-2">{children}</div>
    </section>
  );
}

type SegmentType = Segment["type"];

export function LessonStructuredText({
  source,
  className,
  skipTypes = [],
}: {
  source: string;
  className?: string;
  /** Не рендерить блоки (например mini_case — показывается отдельной карточкой) */
  skipTypes?: SegmentType[];
}) {
  const segments = parseLessonStructure(source);
  const skip = new Set(skipTypes);

  return (
    <article className={cn("lesson-reading mx-auto w-full max-w-prose space-y-8 text-pretty", prose, className)}>
      {segments.map((seg, i) => {
        if (skip.has(seg.type)) return null;
        switch (seg.type) {
          case "h2":
            return (
              <h2 key={i} className="scroll-mt-28 border-b border-border/70 pb-2.5 pt-1 text-2xl font-semibold tracking-tight text-foreground">
                {renderInlineText(seg.text)}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="scroll-mt-28 text-xl font-semibold tracking-tight text-foreground">
                {renderInlineText(seg.text)}
              </h3>
            );
          case "p":
            return (
              <p key={i} className="max-w-prose whitespace-pre-wrap">
                {renderInlineText(seg.text)}
              </p>
            );
          case "def":
            return (
              <InfoCard key={i} title={seg.title} label="Термин">
                <p className="whitespace-pre-wrap">{renderInlineText(seg.body)}</p>
              </InfoCard>
            );
          case "ex":
            return (
              <BlockShell
                key={i}
                className="border border-border/80 bg-muted/35 ring-1 ring-inset ring-border/40"
                label="Пример из практики"
                labelClass="text-muted-foreground"
                title={seg.title}
              >
                <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">{renderInlineText(seg.body)}</p>
              </BlockShell>
            );
          case "intro":
            return (
              <BlockShell
                key={i}
                className="border-l-4 border-l-violet-500/70 bg-violet-500/6 ring-1 ring-inset ring-border/50"
                label="Вступление"
                labelClass="text-violet-600 dark:text-violet-400"
                title={seg.title}
              >
                <p className="whitespace-pre-wrap text-base leading-relaxed text-muted-foreground">{renderInlineText(seg.body)}</p>
              </BlockShell>
            );
          case "why":
            return (
              <BlockShell
                key={i}
                className="border border-sky-500/25 bg-sky-500/6 ring-1 ring-inset ring-sky-500/15"
                label="Зачем это знать"
                labelClass="text-sky-700 dark:text-sky-400"
                title={seg.title}
              >
                <p className="whitespace-pre-wrap text-base leading-relaxed text-muted-foreground">{renderInlineText(seg.body)}</p>
              </BlockShell>
            );
          case "theory":
            return (
              <InfoCard key={i} title={seg.title} label="Теория" variant="accent">
                <p className="whitespace-pre-wrap text-foreground/90">{renderInlineText(seg.body)}</p>
              </InfoCard>
            );
          case "warning":
            return (
              <WarningCard key={i} title={seg.title}>
                <p className="whitespace-pre-wrap">{renderInlineText(seg.body)}</p>
              </WarningCard>
            );
          case "info":
            return (
              <LearningCallout key={i} variant="info" title={seg.title}>
                <p className="whitespace-pre-wrap">{renderInlineText(seg.body)}</p>
              </LearningCallout>
            );
          case "success":
            return (
              <LearningCallout key={i} variant="success" title={seg.title}>
                <p className="whitespace-pre-wrap">{renderInlineText(seg.body)}</p>
              </LearningCallout>
            );
          case "danger":
            return (
              <WarningCard key={i} title={seg.title} security>
                <p className="whitespace-pre-wrap">{renderInlineText(seg.body)}</p>
              </WarningCard>
            );
          case "code":
            return <TerminalBlock key={i} language={seg.language || undefined} code={seg.body} />;
          case "checklist":
            return <Checklist key={i} items={seg.items} />;
          case "how":
            return (
              <BlockShell
                key={i}
                className="border border-emerald-500/25 bg-emerald-500/5 ring-1 ring-inset ring-emerald-500/15"
                label="Как правильно"
                labelClass="text-emerald-800 dark:text-emerald-400"
                title={seg.title}
              >
                <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">{renderInlineText(seg.body)}</p>
              </BlockShell>
            );
          case "mini_case":
            return (
              <BlockShell
                key={i}
                className="border-2 border-dashed border-border bg-transparent ring-0"
                label="Мини-кейс"
                labelClass="text-muted-foreground"
                title={seg.title}
              >
                <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">{renderInlineText(seg.body)}</p>
              </BlockShell>
            );
          case "remember":
            return (
              <LearningCallout key={i} variant="success" title={seg.title} label="Важно запомнить">
                <p className="whitespace-pre-wrap">{renderInlineText(seg.body)}</p>
              </LearningCallout>
            );
          case "outro":
            return (
              <BlockShell
                key={i}
                className="border border-primary/30 bg-linear-to-br from-primary/7 to-card ring-1 ring-inset ring-primary/15"
                label="Итог"
                labelClass="text-primary"
                title={seg.title}
              >
                <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">{renderInlineText(seg.body)}</p>
              </BlockShell>
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
                        <dd className="mt-1 text-base leading-relaxed text-muted-foreground">{renderInlineText(it.description)}</dd>
                      ) : null}
                    </div>
                  ))}
                </dl>
              </section>
            );
          case "quote":
            return (
              <div
                key={i}
                className="rounded-2xl border border-border/80 bg-muted/40 px-5 py-4 text-base leading-relaxed text-muted-foreground"
              >
                {seg.lines.map((line, j) => (
                  <p key={j} className={j ? "mt-2 max-w-prose whitespace-pre-wrap" : "max-w-prose whitespace-pre-wrap"}>
                    {renderInlineText(line)}
                  </p>
                ))}
              </div>
            );
          case "ul":
            return (
              <ul key={i} className="max-w-prose list-disc space-y-2.5 pl-5 text-base leading-relaxed text-foreground/90 marker:text-primary">
                {seg.items.map((item, j) => (
                  <li key={j} className="pl-1">
                    {renderInlineText(item)}
                  </li>
                ))}
              </ul>
            );
          case "table":
            return (
              <div key={i} className="lesson-table-wrap -mx-1 overflow-x-auto rounded-xl border border-border/80 px-1">
                <table className="w-full min-w-72 border-collapse text-left text-sm">
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
          default:
            return null;
        }
      })}
    </article>
  );
}
