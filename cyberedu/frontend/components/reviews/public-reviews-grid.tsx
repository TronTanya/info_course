"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReviewStars } from "@/components/reviews/review-stars";
import { SectionCard } from "@/components/ui/section-card";

export type PublicReviewItem = {
  id: string;
  name: string;
  educationalInstitution: string;
  text: string;
  rating: number;
  createdAt: string;
};

export function PublicReviewsGrid({ reviews }: { reviews: PublicReviewItem[] }) {
  const reduce = useReducedMotion();

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {reviews.map((r, index) => (
        <motion.div
          key={r.id}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: (index % 6) * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionCard variant="lab" className="flex h-full flex-col">
            <ReviewStars value={r.rating} />
            <div className="mt-3">
              <p className="font-semibold text-foreground">{r.name}</p>
              <p className="text-sm text-muted-foreground">{r.educationalInstitution}</p>
            </div>
            <blockquote className="mt-4 border-l-2 border-primary/30 pl-4 text-sm leading-relaxed text-muted-foreground">
              {r.text}
            </blockquote>
            <p className="mt-3 text-xs text-muted-foreground">
              {new Date(r.createdAt).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </SectionCard>
        </motion.div>
      ))}
    </div>
  );
}
