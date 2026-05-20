import { LabTerminal } from "@/components/ui/lab-terminal";
import { cn } from "@/lib/utils";

export type TerminalBlockProps = {
  code: string;
  language?: string;
  title?: string;
  prompt?: string;
  className?: string;
};

export function TerminalBlock({
  code,
  language,
  title = "terminal",
  prompt = "lab@cyberedu:~$",
  className,
}: TerminalBlockProps) {
  const isShell =
    !language || ["bash", "sh", "shell", "zsh", "cmd", "powershell"].includes(language.toLowerCase());
  const chromeTitle = isShell ? title : `${title} · ${language}`;

  return (
    <LabTerminal title={chromeTitle} chrome className={cn("shadow-card", className)}>
      {isShell ? <p className="ce-terminal-prompt mb-2">{prompt}</p> : null}
      <pre className="ce-code-scroll m-0 max-w-full overflow-x-auto whitespace-pre text-[13px] leading-relaxed">
        <code className="font-mono">{code}</code>
      </pre>
    </LabTerminal>
  );
}
