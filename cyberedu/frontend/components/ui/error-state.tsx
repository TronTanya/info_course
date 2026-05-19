import { ErrorCard } from "@/components/ui/error-card";
import { cn } from "@/lib/utils";

export type ErrorStateProps = {
  className?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  code?: string;
  server?: boolean;
};

/** @deprecated Предпочитайте `ErrorCard` — алиас для обратной совместимости. */
export function ErrorState({ className, title, description, action, code, server }: ErrorStateProps) {
  return (
    <ErrorCard
      className={cn(className)}
      title={title}
      description={description}
      action={action}
      code={code}
      server={server}
    />
  );
}
