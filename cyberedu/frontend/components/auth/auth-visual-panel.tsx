import { LandingSecurityCore } from "@/components/home/landing-security-core";
import { Badge } from "@/components/ui/badge";
import { LabTerminal } from "@/components/ui/lab-terminal";
import { cn } from "@/lib/utils";

const statusLines = [
  { label: "session", value: "tls1.3 · aes-256-gcm" },
  { label: "lab", value: "sandbox isolated" },
  { label: "core", value: "threat-model active" },
] as const;

/** Правая колонка auth: Security Core + Cyber Lab (desktop). */
export function AuthVisualPanel({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "ce-auth-visual-panel relative hidden min-h-full flex-col justify-center overflow-hidden border-l border-primary/15 p-8 xl:p-12 lg:flex",
        className,
      )}
      aria-hidden
    >
      <div className="ce-tech-grid pointer-events-none absolute inset-0 opacity-[0.14]" />
      <div
        className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-primary/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-cyan/10 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-8">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="primary">Cyber Lab</Badge>
            <Badge variant="cyan">Security Core</Badge>
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground xl:text-4xl">
            Учебная среда
            <span className="block text-primary">без компромиссов</span>
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            Практика в изолированных лабораториях, тесты с автопроверкой и траектория от новичка до SOC-аналитика.
          </p>
        </div>

        <LandingSecurityCore className="max-w-md" />

        <LabTerminal title="~/cyberedu/auth" chrome className="max-w-md">
          <div className="space-y-2 font-mono text-xs sm:text-sm">
            <p>
              <span className="ce-terminal-prompt">operator@lab</span>
              <span className="ce-terminal-sep">:</span>
              <span className="ce-terminal-path">~</span>
              <span className="ce-terminal-sep">$</span>{" "}
              <span className="ce-terminal-cmd">auth --secure-session</span>
            </p>
            <p className="ce-terminal-dim">
              <span className="ce-terminal-accent">{">"}</span> handshake ok · identity vault locked
            </p>
            <ul className="ce-terminal-divider mt-3 space-y-1.5 border-t pt-3">
              {statusLines.map((line) => (
                <li key={line.label} className="flex justify-between gap-4">
                  <span className="ce-terminal-accent">{line.label}</span>
                  <span className="ce-terminal-cmd">{line.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </LabTerminal>
      </div>
    </aside>
  );
}
