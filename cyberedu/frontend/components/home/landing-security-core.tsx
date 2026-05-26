import { cn } from "@/lib/utils";

const nodes = [
  { id: "network", label: "Network", x: 50, y: 8 },
  { id: "web", label: "Web", x: 88, y: 32 },
  { id: "linux", label: "Linux", x: 78, y: 78 },
  { id: "crypto", label: "Crypto", x: 22, y: 78 },
  { id: "soc", label: "SOC", x: 12, y: 32 },
] as const;

type LandingSecurityCoreProps = {
  className?: string;
};

/** CSS/SVG визуал Security Core — без тяжёлой 3D-графики */
export function LandingSecurityCore({ className }: LandingSecurityCoreProps) {
  const cx = 50;
  const cy = 50;

  return (
    <div
      className={cn(
        "ce-security-core relative mx-auto aspect-square w-full max-w-[min(100%,420px)] select-none",
        className,
      )}
      aria-hidden
    >
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_70%)]" />

      <svg viewBox="0 0 100 100" className="relative h-full w-full" role="presentation">
        <defs>
          <linearGradient id="ce-core-line" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
            <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.35" />
          </linearGradient>
          <filter id="ce-core-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Орбитальное кольцо */}
        <circle
          cx={cx}
          cy={cy}
          r="38"
          fill="none"
          stroke="url(#ce-core-line)"
          strokeWidth="0.35"
          strokeDasharray="2 3"
          className="ce-security-core-orbit motion-reduce:opacity-80"
        />

        {/* Линии к модулям */}
        {nodes.map((node) => (
          <line
            key={`line-${node.id}`}
            x1={cx}
            y1={cy}
            x2={node.x}
            y2={node.y}
            stroke="url(#ce-core-line)"
            strokeWidth="0.4"
            className="ce-security-core-pulse"
          />
        ))}

        {/* Центральный узел */}
        <g filter="url(#ce-core-glow)">
          <circle cx={cx} cy={cy} r="14" className="fill-[color-mix(in_oklab,var(--card)_90%,var(--primary)_10%)] stroke-primary/50" strokeWidth="0.5" />
          <circle cx={cx} cy={cy} r="10" fill="none" stroke="var(--primary)" strokeWidth="0.35" opacity="0.6" />
        </g>
      </svg>

      {/* Подписи модулей */}
      <ul className="absolute inset-0">
        {nodes.map((node) => (
          <li
            key={node.id}
            className="ce-security-core-node absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            <span className="ce-security-core-node-inner inline-flex min-w-18 flex-col items-center gap-0.5 rounded-xl border border-primary/20 bg-card px-2 py-1.5 text-center shadow-card transition-colors transition-shadow transition-transform duration-200 hover:border-primary/35 hover:shadow-card-hover">
              <span className="size-1.5 rounded-full bg-primary" />
              <span className="font-mono text-2xs font-semibold uppercase tracking-wider text-foreground/90 sm:text-2.5">
                {node.label}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <div className="pointer-events-none absolute left-1/2 top-1/2 w-[min(70%,11rem)] -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="font-mono text-2.5 font-semibold uppercase tracking-eyebrow text-primary sm:text-xs">Security</p>
        <p className="font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">Core</p>
      </div>
    </div>
  );
}
