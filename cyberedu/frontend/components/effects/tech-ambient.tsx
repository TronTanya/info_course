"use client";

/** Фоновый SOC-слой: сетка, орбы, scanline (только CSS-анимации). */
export function TechAmbient() {
  return (
    <div className="ce-tech-ambient pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="ce-tech-grid absolute inset-0 opacity-[0.55] dark:opacity-[0.35]" />
      <div className="ce-orb ce-orb-a absolute -left-[12%] top-[8%] size-[min(42vw,28rem)]" />
      <div className="ce-orb ce-orb-b absolute -right-[8%] top-[35%] size-[min(36vw,22rem)]" />
      <div className="ce-orb ce-orb-c absolute bottom-[5%] left-[30%] size-[min(30vw,18rem)]" />
      <div className="ce-tech-scanline absolute inset-0" />
    </div>
  );
}
