import type { PracticeEvidenceBlock } from "@/lib/practice-scenario-parse";
import {
  extractHttpLinksFromText,
  parseLogContent,
  parseUrlForDisplay,
} from "@/lib/evidence-panel";
import type { EvidenceItem } from "@/types/practice-view-model";

/** Маппинг учебных блоков сценария → безопасные EvidenceItem для EvidencePanel. */
export function mapPracticeEvidenceBlocksToItems(blocks: PracticeEvidenceBlock[]): EvidenceItem[] {
  return blocks.flatMap((block, index) => evidenceBlockToItem(block, index));
}

function evidenceBlockToItem(block: PracticeEvidenceBlock, index: number): EvidenceItem[] {
  const baseId = `ev-${index}`;
  switch (block.kind) {
    case "email": {
      const bodyLinks = extractHttpLinksFromText(block.body);
      const links = [...new Set([...(block.links ?? []), ...bodyLinks])];
      return [
        {
          id: baseId,
          type: "email",
          title: "Учебное письмо",
          content: block.body,
          metadata: {
            from: block.from,
            to: block.to ?? "",
            subject: block.subject,
            date: block.date ?? "",
          },
          links: links.length > 0 ? links : undefined,
          attachments: block.attachments,
        },
      ];
    }
    case "url_list":
      return block.urls.map((u, i) => ({
        id: `${baseId}-url-${i}`,
        type: "url" as const,
        title: u.label,
        content: u.href,
        metadata: { listTitle: block.title },
        urlDisplay: parseUrlForDisplay(u.href, u.visibleText),
      }));
    case "log":
      return [
        {
          id: baseId,
          type: "log",
          title: block.title,
          content: block.lines,
          logEntries: parseLogContent(block.lines),
        },
      ];
    case "hash":
      return [
        {
          id: baseId,
          type: "code",
          title: block.label,
          content: block.value,
          metadata: block.algorithm ? { algorithm: block.algorithm } : undefined,
        },
      ];
    case "text":
      return [
        {
          id: baseId,
          type: "text",
          title: block.title,
          content: block.content,
        },
      ];
    case "indicator_table":
      return [
        {
          id: baseId,
          type: "table",
          title: block.title,
          tableHeaders: block.headers,
          tableRows: block.rows,
        },
      ];
    default:
      return [];
  }
}
