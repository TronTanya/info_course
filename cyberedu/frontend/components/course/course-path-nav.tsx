import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { cn } from "@/lib/utils";

export function CoursePathNav({ className }: { className?: string }) {
  return (
    <Breadcrumbs
      className={cn(className)}
      items={[
        { href: "/dashboard", label: "Кабинет" },
        { label: "Карта курса" },
      ]}
    />
  );
}
