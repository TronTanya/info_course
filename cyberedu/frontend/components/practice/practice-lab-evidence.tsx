import type { PracticalTaskType } from "@prisma/client";
import { FolderOpen } from "lucide-react";
import type { PracticeEvidenceBlock } from "@/lib/practice-scenario-parse";
import { mapPracticeEvidenceBlocksToItems } from "@/lib/evidence-panel-map";
import { PRACTICE_SECTION_EMPTY } from "@/lib/practice-page-state";
import type { EvidenceItem } from "@/types/practice-view-model";
import { EvidencePanel } from "@/components/practice/evidence-panel";
import { PracticeSectionEmpty } from "@/components/practice/practice-page-states";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";

export function PracticeLabEvidence({
  items,
  blocks,
  taskType,
  className,
}: {
  /** Предпочтительно: безопасные items из PracticeViewModel */
  items?: EvidenceItem[];
  /** Fallback: блоки сценария до маппинга */
  blocks?: PracticeEvidenceBlock[];
  taskType: PracticalTaskType;
  className?: string;
}) {
  const resolved = items ?? (blocks ? mapPracticeEvidenceBlocksToItems(blocks) : []);
  const emptyCopy = PRACTICE_SECTION_EMPTY.evidence;
  const showPhishingNote = taskType === "PHISHING_ANALYSIS";

  if (resolved.length === 0) {
    return (
      <SectionCard
        variant="lab"
        flushTitle
        className={cn("ce-practice-evidence relative min-w-0 overflow-x-clip p-4 sm:p-6", className)}
        aria-label="Артефакты для расследования"
      >
        <PracticeSectionEmpty
          title={emptyCopy.title}
          message={emptyCopy.message}
          icon={<FolderOpen className="size-6" aria-hidden />}
        />
      </SectionCard>
    );
  }

  return (
    <SectionCard
      variant="lab"
      flushTitle
      className={cn("ce-practice-evidence relative min-w-0 space-y-4 overflow-x-clip p-4 sm:p-6", className)}
    >
      <div className="ce-tech-grid pointer-events-none absolute inset-0 opacity-[0.05]" aria-hidden />
      <div className="relative space-y-1">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Артефакты</p>
        <h2 className="font-display text-lg font-semibold text-foreground">Данные для расследования</h2>
        <p className="text-xs text-muted-foreground">
          Учебные материалы. Подозрительные ссылки не открываются — только копирование.
        </p>
      </div>

      {showPhishingNote ? (
        <p className="relative rounded-lg border border-warning/30 bg-warning/8 px-3 py-2 text-xs text-muted-foreground">
          Подозрительное письмо — анализируйте поля и ссылки ниже. Эталонные ответы не показываются.
        </p>
      ) : null}

      <EvidencePanel items={resolved} className="relative" />
    </SectionCard>
  );
}
