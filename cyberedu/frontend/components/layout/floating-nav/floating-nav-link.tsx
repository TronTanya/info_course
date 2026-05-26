"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type FloatingNavLinkProps = {
  href: string;
  active: boolean;
  children: React.ReactNode;
  className?: string;
  /** Unique layoutId namespace per nav group */
  layoutId?: string;
  onClick?: () => void;
};

export function FloatingNavLink({
  href,
  active,
  children,
  className,
  layoutId = "floating-nav-indicator",
  onClick,
}: FloatingNavLinkProps) {
  const reduce = useReducedMotion();

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn("ce-floating-nav-link", active && "ce-floating-nav-link--active", className)}
      aria-current={active ? "page" : undefined}
    >
      {children}
      {active && !reduce ? (
        <motion.span
          layoutId={layoutId}
          className="ce-floating-nav-link__indicator"
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
        />
      ) : active ? (
        <span className="ce-floating-nav-link__indicator" />
      ) : null}
    </Link>
  );
}
