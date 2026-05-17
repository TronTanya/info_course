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
  return (
    <div className={cn("group relative overflow-hidden rounded-2xl border border-border/80 bg-[#0d1117]/95 shadow-inner", className)}>
      {language ? (
        <div className="border-b border-white/10 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-white/50">
          {language}
        </div>
      ) : null}
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-emerald-100/95">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}
