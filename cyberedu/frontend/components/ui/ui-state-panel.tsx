import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorCard } from "@/components/ui/error-card";
import { LoadingState } from "@/components/ui/loading-state";
import { SuccessState } from "@/components/ui/success-state";

export type UiStatePanelProps =
  | {
      state: "idle";
      children: ReactNode;
    }
  | {
      state: "loading";
      label?: string;
      skeleton?: ReactNode;
    }
  | {
      state: "empty";
      title: string;
      description?: string;
      icon?: ReactNode;
      action?: ReactNode;
      terminalLine?: string;
      className?: string;
    }
  | {
      state: "error";
      title: string;
      description?: string;
      code?: string;
      action?: ReactNode;
      server?: boolean;
    }
  | {
      state: "success";
      title: string;
      description?: string;
      action?: ReactNode;
      compact?: boolean;
    };

/** Универсальный переключатель состояний экрана / секции. */
export function UiStatePanel(props: UiStatePanelProps) {
  if (props.state === "idle") {
    return <>{props.children}</>;
  }
  if (props.state === "loading") {
    return props.skeleton ?? <LoadingState label={props.label} />;
  }
  if (props.state === "empty") {
    return (
      <EmptyState
        title={props.title}
        description={props.description}
        icon={props.icon}
        action={props.action}
        terminalLine={props.terminalLine}
        className={props.className}
      />
    );
  }
  if (props.state === "error") {
    return (
      <ErrorCard
        title={props.title}
        description={props.description}
        code={props.code}
        action={props.action}
        server={props.server}
      />
    );
  }
  return (
    <SuccessState
      title={props.title}
      description={props.description}
      action={props.action}
      compact={props.compact}
    />
  );
}
