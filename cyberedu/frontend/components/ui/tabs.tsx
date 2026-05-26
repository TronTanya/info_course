"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { tabsVariants } from "@/lib/design-system/components";
import { focusRing, transitionBase } from "@/lib/design-system/primitives";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(tabsVariants.list, transitionBase, className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(tabsVariants.trigger, transitionBase, focusRing, className)}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn(tabsVariants.content, transitionBase, focusRing, "outline-hidden", className)}
      {...props}
    />
  );
}
