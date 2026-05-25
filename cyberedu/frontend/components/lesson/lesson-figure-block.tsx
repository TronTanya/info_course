import { safeLessonImageSrc } from "@/lib/safe-lesson-url";
import { cn } from "@/lib/utils";

export function LessonFigureBlock({
  title,
  src,
  caption,
  className,
  id,
}: {
  title: string;
  src: string;
  caption?: string;
  className?: string;
  id?: string;
}) {
  const safeSrc = safeLessonImageSrc(src);
  if (!safeSrc) return null;

  const alt = caption || title || "Иллюстрация к лекции";

  return (
    <figure
      id={id}
      className={cn(
        "overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-muted/40 via-background to-muted/20 ring-1 ring-inset ring-border/50",
        className,
      )}
    >
      {title ? (
        <figcaption className="border-b border-border/60 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </figcaption>
      ) : null}
      <div className="relative aspect-[2/1] w-full overflow-hidden bg-muted/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={safeSrc}
          alt={alt}
          width={800}
          height={400}
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading="lazy"
          decoding="async"
        />
      </div>
      {caption ? (
        <figcaption className="px-4 py-3 text-sm leading-relaxed text-muted-foreground">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
