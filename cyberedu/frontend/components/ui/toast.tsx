"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastContextValue = {
  toasts: ToastItem[];
  toast: (item: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

let toastId = 0;

const variantStyles: Record<ToastVariant, string> = {
  default: "border-border bg-popover text-popover-foreground",
  success: "border-success/30 bg-success/10 text-foreground",
  error: "border-danger/35 bg-danger/10 text-foreground",
  warning: "border-warning/35 bg-warning/10 text-foreground",
  info: "border-cyan/30 bg-cyan/10 text-foreground",
};

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  default: <Info className="size-4 shrink-0 text-muted-foreground" aria-hidden />,
  success: <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden />,
  error: <AlertCircle className="size-4 shrink-0 text-danger" aria-hidden />,
  warning: <AlertTriangle className="size-4 shrink-0 text-warning" aria-hidden />,
  info: <Info className="size-4 shrink-0 text-cyan" aria-hidden />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    (item: Omit<ToastItem, "id">) => {
      const id = `toast-${++toastId}`;
      const duration = item.duration ?? 5000;
      setToasts((prev) => [...prev, { ...item, id }]);
      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss],
  );

  const value = React.useMemo(() => ({ toasts, toast, dismiss }), [toasts, toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToasterViewport toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

function ToasterViewport({ toasts, dismiss }: { toasts: ToastItem[]; dismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  const hasAssertive = toasts.some((t) => t.variant === "error");

  return (
    <div
      aria-live={hasAssertive ? "assertive" : "polite"}
      aria-relevant="additions"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-end gap-2 p-4 sm:inset-x-auto sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-sm"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const variant = item.variant ?? "default";

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex w-full max-w-sm gap-3 rounded-xl border p-4 shadow-card backdrop-blur-md",
        "animate-[ce-toast-in_0.35s_var(--ease-out-expo)_forwards] motion-reduce:animate-none",
        variantStyles[variant],
      )}
    >
      {variantIcons[variant]}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-snug">{item.title}</p>
        {item.description ? <p className="mt-1 text-xs leading-relaxed opacity-90">{item.description}</p> : null}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="ce-focus-ring -m-1 shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Закрыть уведомление"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
