import { resolveAvatarImageSrc, userInitials } from "@/lib/avatar-display";
import { cn } from "@/lib/utils";

export function UserAvatar({
  avatarUrl,
  name,
  email,
  size = "md",
  className,
}: {
  avatarUrl?: string | null;
  name?: string | null;
  email?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const src = resolveAvatarImageSrc(avatarUrl ?? null);
  const initials = userInitials(name, email);
  const sizeClass =
    size === "sm" ? "size-8 text-xs" : size === "lg" ? "size-12 text-base" : "size-9 text-xs";

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 font-mono font-bold text-primary ring-1 ring-primary/20",
        sizeClass,
        className,
      )}
      aria-hidden={!src}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- пресеты SVG и /api/profile/avatar/image
        <img src={src} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        initials
      )}
    </span>
  );
}
