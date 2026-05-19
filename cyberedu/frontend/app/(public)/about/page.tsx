import type { Metadata } from "next";
import { SectionCard } from "@/components/ui/section-card";

export const metadata: Metadata = {
  title: "О курсе",
};

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">О курсе</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Платформа для изучения основ информационной безопасности: угрозы, защита данных, сети и практические сценарии.
        </p>
      </div>
      <SectionCard variant="lab" title="Программа (черновик)">
        <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
          <li>Введение и модель угроз</li>
          <li>Криптография и целостность</li>
          <li>Сетевая безопасность</li>
          <li>Инцидент-менеджмент</li>
        </ul>
      </SectionCard>
    </div>
  );
}
