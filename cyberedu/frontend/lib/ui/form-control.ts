import { focusRing, inputSurface, transitionBase } from "@/lib/design-system/primitives";

/** Shared field styles for Input, Textarea, Select */
export const formControlClass = `${inputSurface} ${transitionBase} ${focusRing}`;

export const formControlErrorClass =
  "border-danger hover:border-danger focus-visible:ring-danger aria-invalid:border-danger";
