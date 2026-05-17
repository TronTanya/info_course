import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/breadcrumbs";

export function adminBreadcrumbItems(currentLabel: string, parent?: BreadcrumbItem): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ href: "/admin", label: "Админка" }];
  if (parent) items.push(parent);
  items.push({ label: currentLabel });
  return items;
}

export function AdminBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return <Breadcrumbs items={items} />;
}
