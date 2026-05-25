import { KeyTermsGrid, type KeyTermsGridProps } from "@/components/lesson/key-terms-grid";

export type LessonKeyTermsProps = KeyTermsGridProps;

/** @deprecated Используйте `KeyTermsGrid` напрямую. */
export function LessonKeyTerms(props: LessonKeyTermsProps) {
  return <KeyTermsGrid {...props} />;
}
