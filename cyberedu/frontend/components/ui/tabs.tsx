"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { focusRing, transitionBase } from "@/lib/design-system/primitives";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex h-11 min-h-11 w-full max-w-full items-center justify-start gap-1 overflow-x-auto rounded-2xl bg-muted p-1 text-muted-foreground ring-1 ring-inset ring-border sm:w-auto",
        transitionBase,
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex min-h-9 flex-1 items-center justify-center whitespace-nowrap rounded-xl px-3 py-1.5 text-sm font-medium sm:flex-none",
        transitionBase,
        focusRing,
        "hover:text-foreground",
        "data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-card data-[state=active]:ring-1 data-[state=active]:ring-primary/20",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn(
        "mt-4 rounded-2xl border border-border bg-card p-4 text-sm text-card-foreground shadow-card outline-none",
        transitionBase,
        focusRing,
        className,
      )}
      {...props}
    />
  );
}
