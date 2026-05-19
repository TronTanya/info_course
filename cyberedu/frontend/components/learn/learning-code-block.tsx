import { LabTerminal } from "@/components/ui/lab-terminal";
import { cn } from "@/lib/utils";

export function LearningCodeBlock({
  code,
  language,
  className,
}: {
  code: string;
  language?: string;
  className?: string;
}) {
  const lang = language?.trim();
  return (
    <LabTerminal title={lang ?? "snippet"} chrome={Boolean(lang)} className={cn("shadow-card", className)}>
      <pre className="m-0 overflow-x-auto text-[13px] leading-relaxed">
        <code className="ce-terminal-cmd font-mono">{code}</code>
      </pre>
    </LabTerminal>
  );
}
