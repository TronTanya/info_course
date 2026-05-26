"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";

type Particle = { x: number; y: number; size: number; opacity: number; speed: number };

export function HeroParticles({ className }: { className?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const particlesRef = React.useRef<Particle[]>([]);

  React.useEffect(() => {
    if (reduce) return;
    const narrow = window.matchMedia("(max-width: 1023px)");
    if (narrow.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
      const { width, height } = parent.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const maxParticles = width < 768 ? 24 : 48;
      const count = Math.min(maxParticles, Math.floor((width * height) / 12000));
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.35 + 0.1,
        speed: Math.random() * 0.25 + 0.08,
      }));
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    let raf = 0;

    const draw = () => {
      const { width, height } = parent.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      for (const p of particlesRef.current) {
        p.y -= p.speed;
        if (p.y < 0) p.y = height;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(129, 140, 248, ${p.opacity})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reduce]);

  if (reduce) return null;

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden
      style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.7 }}
    />
  );
}
