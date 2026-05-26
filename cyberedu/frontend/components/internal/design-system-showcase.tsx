import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MetricCard } from "@/components/ui/metric-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HolographicPanel } from "@/components/ui/holographic-panel";
import { widgetVariants } from "@/lib/design-system/components";
import { palette } from "@/lib/design-system/palette";
import { typography } from "@/lib/design-system/tokens";
import { cn } from "@/lib/utils";

const swatches = [
  { name: "Base", value: palette.bg.base },
  { name: "Primary", value: palette.brand.primary },
  { name: "Accent", value: palette.brand.accent },
  { name: "Text", value: palette.text.primary },
  { name: "Muted", value: palette.text.muted },
  { name: "Success", value: palette.semantic.success },
] as const;

export function DesignSystemShowcase() {
  return (
    <section className="ds-stack-lg" aria-labelledby="ds-showcase-heading">
      <header className="space-y-2">
        <p className={typography.eyebrow}>Design System v3.1</p>
        <h2 id="ds-showcase-heading" className={typography.h2}>
          Premium cyber OS tokens
        </h2>
        <p className={typography.bodyMuted}>
          Tokens: <code className="font-mono text-xs">app/design-tokens.css</code> · Utilities:{" "}
          <code className="font-mono text-xs">app/design-system.css</code> · TS:{" "}
          <code className="font-mono text-xs">lib/design-system/</code>
        </p>
      </header>

      <HolographicPanel glow padding="lg" className="ds-stack">
        <h3 className={typography.h3}>Color tokens</h3>
        <ul className="flex flex-wrap gap-3">
          {swatches.map((s) => (
            <li key={s.name} className="flex flex-col gap-1.5">
              <span
                className="size-14 rounded-2xl border border-white/10 shadow-ce-glow-soft"
                style={{ background: s.value }}
                aria-hidden
              />
              <span className="font-mono text-2.5 text-muted-foreground">{s.name}</span>
            </li>
          ))}
        </ul>
      </HolographicPanel>

      <div className="ds-grid-auto">
        <div className="ds-stack">
          <h3 className={typography.h3}>Typography</h3>
          <p className={typography.display}>Display</p>
          <p className={typography.h1}>Heading 1</p>
          <p className={typography.h2}>Heading 2</p>
          <p className={typography.body}>Body text for interfaces.</p>
          <p className={typography.metric}>98%</p>
        </div>

        <div className="ds-stack">
          <h3 className={typography.h3}>Buttons</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>
        </div>

        <div className="ds-stack">
          <h3 className={typography.h3}>Input</h3>
          <Input label="Email" placeholder="analyst@cyberedu.local" hint="Glass field style" />
        </div>
      </div>

      <div className={cn(widgetVariants.hero, "p-6")}>
        <p className={widgetVariants.label}>Dashboard widget · hero</p>
        <p className={cn(widgetVariants.value, "mt-2 ds-text-gradient")}>2,847</p>
        <p className={typography.caption}>Active learners this week</p>
      </div>

      <div className="ds-grid-dashboard">
        <MetricCard variant="accent" label="Modules" value="12" hint="Course track" className="ds-widget-span-4" />
        <MetricCard variant="default" label="Labs" value="24+" hint="SOC scenarios" className="ds-widget-span-4" />
        <MetricCard variant="cyan" label="AI Mentor" value="24/7" className="ds-widget-span-4" />
        <Card glow interactive className="ds-widget-span-8">
          <CardHeader>
            <CardTitle>Card · glass</CardTitle>
            <CardDescription>Interactive premium surface with glow.</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="primary">Status</Badge>
          </CardContent>
        </Card>
        <div className="ds-widget-span-4 ds-stack p-5">
          <h3 className={typography.h3}>Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Analyst</TableCell>
                <TableCell>Student</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Admin</TableCell>
                <TableCell>ADMIN</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
