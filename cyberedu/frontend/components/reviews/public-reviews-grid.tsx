"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReviewStars } from "@/components/reviews/review-stars";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
          <Card className="ce-learn-panel h-full border-border/90 bg-card/95 shadow-card transition-shadow hover:shadow-card-hover">
            <CardHeader className="space-y-3 pb-2">
              <ReviewStars value={r.rating} />
              <div>
                <p className="font-semibold text-foreground">{r.name}</p>
                <p className="text-sm text-muted-foreground">{r.educationalInstitution}</p>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <blockquote className="border-l-2 border-primary/30 pl-4 text-sm leading-relaxed text-muted-foreground">
                {r.text}
              </blockquote>
              <p className="mt-3 text-xs text-muted-foreground">
                {new Date(r.createdAt).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
