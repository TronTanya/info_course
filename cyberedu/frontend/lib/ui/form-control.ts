import { inputVariants } from "@/lib/design-system/components";
import { focusRing, transitionBase } from "@/lib/design-system/primitives";
import { cn } from "@/lib/utils";

/** Shared field styles for Input, Textarea, Select */
export const formControlClass = cn(inputVariants.base, transitionBase, focusRing);

export const formControlErrorClass = cn(inputVariants.error, "hover:border-danger");
