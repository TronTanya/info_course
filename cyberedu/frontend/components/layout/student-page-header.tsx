import type { ReactNode } from "react";
import { CyberPageHeader } from "@/components/cyber/cyber-page-header";
import type { BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { cn } from "@/lib/utils";

export function StudentPageHeader({
  breadcrumbItems,
  eyebrow,
  title,
  description,
  backHref,
  backLabel = "← Назад",
  actions,
  className,
}: {
  breadcrumbItems?: BreadcrumbItem[];
  eyebrow?: string;
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <CyberPageHeader
      breadcrumbItems={breadcrumbItems}
      eyebrow={eyebrow}
      title={title}
      subtitle={description}
      backHref={backHref}
      backLabel={backLabel}
      actions={actions}
      className={cn(className)}
    />
  );
}
