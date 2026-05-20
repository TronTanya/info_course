import type { PracticalTaskType } from "@prisma/client";
import type { PracticeEvidenceBlock } from "@/lib/practice-scenario-parse";
import { PracticeLabTerminal } from "@/components/practice/practice-lab-terminal";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";

function EvidenceEmail({ block }: { block: Extract<PracticeEvidenceBlock, { kind: "email" }> }) {
  return (
    <PracticeLabTerminal title="mail/inbox.eml">
      <dl className="space-y-2 font-mono text-xs">
        <div>
          <dt className="text-muted-foreground">From:</dt>
          <dd className="text-foreground">{block.from}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Subject:</dt>
          <dd className="font-semibold text-foreground">{block.subject}</dd>
        </div>
      </dl>
      <pre className="mt-4 whitespace-pre-wrap border-t border-border/50 pt-4 text-xs leading-relaxed text-foreground/90">
        {block.body}
      </pre>
    </PracticeLabTerminal>
  );
}

function EvidenceUrlList({ block }: { block: Extract<PracticeEvidenceBlock, { kind: "url_list" }> }) {
  return (
    <PracticeLabTerminal title="artifacts/urls.txt">
      <p className="ce-terminal-dim mb-3 text-[10px] uppercase tracking-wider">{block.title}</p>
      <ul className="space-y-2">
        {block.urls.map((u) => (
          <li key={u.href} className="rounded-lg border border-border/60 bg-background/40 px-3 py-2">
            <span className="text-[10px] font-semibold uppercase text-muted-foreground">{u.label}</span>
            <p className="mt-1 break-all font-mono text-xs text-primary">{u.href}</p>
          </li>
        ))}
      </ul>
    </PracticeLabTerminal>
  );
}

function EvidenceLog({ block }: { block: Extract<PracticeEvidenceBlock, { kind: "log" }> }) {
  return (
    <PracticeLabTerminal title="var/log/auth.log">
      <p className="ce-terminal-dim mb-2 text-[10px] uppercase tracking-wider">{block.title}</p>
      <pre className="max-h-72 overflow-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-foreground/90">
        {block.lines}
      </pre>
    </PracticeLabTerminal>
  );
}

function EvidenceHash({ block }: { block: Extract<PracticeEvidenceBlock, { kind: "hash" }> }) {
  return (
    <PracticeLabTerminal title="artifacts/hash.txt">
      <p className="text-xs text-muted-foreground">{block.label}</p>
      {block.algorithm ? (
        <p className="mt-1 font-mono text-[10px] uppercase text-primary">{block.algorithm}</p>
      ) : null}
      <p className="mt-2 break-all font-mono text-sm text-foreground">{block.value}</p>
    </PracticeLabTerminal>
  );
}

function EvidenceText({ block }: { block: Extract<PracticeEvidenceBlock, { kind: "text" }> }) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
      <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary">{block.title}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{block.content}</p>
    </div>
  );
}

function EvidenceTable({ block }: { block: Extract<PracticeEvidenceBlock, { kind: "indicator_table" }> }) {
  return (
    <div className="lesson-table-wrap overflow-x-auto rounded-xl border border-border/80">
      <p className="border-b border-border/60 bg-muted/30 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
        {block.title}
      </p>
      <table className="w-full min-w-[16rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th scope="col" className="px-3 py-2.5 font-semibold text-foreground">
              {block.headers[0]}
            </th>
            <th scope="col" className="px-3 py-2.5 font-semibold text-foreground">
              {block.headers[1]}
            </th>
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, i) => (
            <tr key={i} className="border-b border-border/50 last:border-0 even:bg-muted/10">
              <td className="px-3 py-2.5 align-top font-medium text-foreground">{row.feature}</td>
              <td className="px-3 py-2.5 align-top text-muted-foreground">{row.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PracticeLabEvidence({
  blocks,
  taskType,
  className,
}: {
  blocks: PracticeEvidenceBlock[];
  taskType: PracticalTaskType;
  className?: string;
}) {
  if (blocks.length === 0) return null;

  const showPhishingNote = taskType === "PHISHING_ANALYSIS";

  return (
    <SectionCard
      variant="lab"
      flushTitle
      className={cn("ce-practice-evidence relative space-y-4 overflow-hidden p-5 sm:p-6", className)}
    >
      <div className="ce-tech-grid pointer-events-none absolute inset-0 opacity-[0.05]" aria-hidden />
      <div className="relative space-y-1">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Артефакты</p>
        <h2 className="font-display text-lg font-semibold text-foreground">Данные для расследования</h2>
        <p className="text-xs text-muted-foreground">
          Учебные материалы. Эталонные ответы не показываются до отправки.
        </p>
      </div>

      {showPhishingNote ? (
        <p className="relative rounded-lg border border-warning/30 bg-warning/8 px-3 py-2 text-xs text-muted-foreground">
          Подозрительное письмо — в рабочей области ниже. Таблица помогает сформулировать признаки.
        </p>
      ) : null}

      <div className="relative space-y-4">
        {blocks.map((block, i) => {
          switch (block.kind) {
            case "email":
              return <EvidenceEmail key={i} block={block} />;
            case "url_list":
              return <EvidenceUrlList key={i} block={block} />;
            case "log":
              return <EvidenceLog key={i} block={block} />;
            case "hash":
              return <EvidenceHash key={i} block={block} />;
            case "text":
              return <EvidenceText key={i} block={block} />;
            case "indicator_table":
              return <EvidenceTable key={i} block={block} />;
            default:
              return null;
          }
        })}
      </div>
    </SectionCard>
  );
}
