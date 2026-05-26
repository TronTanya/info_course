"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Brain, Hexagon, Shield } from "lucide-react";
import { LandingCommandCenterPreview } from "@/components/home/landing-command-center-preview";
import { HeroParticles } from "@/components/home/landing-hero/hero-particles";
import { cn } from "@/lib/utils";

const floatTransition = { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const };

export function LandingHeroVisual({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <div className={cn("ce-hero-premium__stage", className)} aria-hidden={false}>
      <HeroParticles />
      <div className="ce-hero-orb-float ce-hero-orb-float--1" aria-hidden />
      <div className="ce-hero-orb-float ce-hero-orb-float--2" aria-hidden />
      <div className="ce-hero-ring" aria-hidden />

      <div className="ce-hero-3d-scene">
        <motion.div
          className="ce-hero-float-shield"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...floatTransition, delay: 0.35 }}
        >
          <div className="ce-hero-holo-panel flex size-16 items-center justify-center rounded-2xl sm:size-18">
            <Shield className="size-7 text-primary sm:size-8" strokeWidth={1.5} />
          </div>
        </motion.div>

        <motion.div
          className="ce-hero-float-core"
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...floatTransition, delay: 0.5 }}
        >
          <div className="ce-hero-holo-panel relative flex size-20 flex-col items-center justify-center gap-1 rounded-3xl p-3 sm:size-24">
            <Hexagon className="size-9 text-accent sm:size-10" strokeWidth={1.25} />
            <span className="font-mono text-2xs font-medium uppercase tracking-widest text-primary/90">AI Core</span>
            <span className="absolute -right-1 -top-1 flex size-3">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-50 motion-reduce:animate-none" />
              <span className="relative inline-flex size-3 rounded-full bg-primary" />
            </span>
          </div>
        </motion.div>

        <motion.div
          className="ce-hero-float-chip"
          initial={reduce ? false : { opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...floatTransition, delay: 0.65 }}
        >
          <div className="ce-hero-holo-panel flex items-center gap-2 rounded-full px-3 py-2">
            <Brain className="size-4 text-cyan" strokeWidth={1.75} />
            <span className="font-mono text-2.5 font-medium text-foreground">Mentor · online</span>
          </div>
        </motion.div>

        <motion.div
          className="ce-hero-preview-wrap mt-8 lg:mt-4"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          whileHover={reduce ? undefined : { y: -4, transition: { duration: 0.28 } }}
        >
          <LandingCommandCenterPreview className="shadow-modal" />
        </motion.div>
      </div>
    </div>
  );
}
