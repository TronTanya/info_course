"use client";

import { motion, useReducedMotion } from "framer-motion";

export function MentorTypingIndicator() {
  const reduce = useReducedMotion();

  return (
    <div className="ce-mentor-typing mr-2 flex items-center gap-2 rounded-xl border border-cyan/15 bg-muted/40 px-3 py-2.5" aria-live="polite" aria-busy="true">
      <span className="sr-only">Наставник формирует ответ</span>
      <div className="flex items-center gap-1" aria-hidden>
        {[0, 1, 2].map((i) =>
          reduce ? (
            <span key={i} className="size-1.5 rounded-full bg-cyan opacity-70" />
          ) : (
            <motion.span
              key={i}
              className="size-1.5 rounded-full bg-cyan"
              animate={{ opacity: [0.35, 1, 0.35], y: [0, -3, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
            />
          ),
        )}
      </div>
      <span className="font-mono text-2.75 uppercase tracking-wider text-muted-foreground">Наставник формирует ответ</span>
    </div>
  );
}
