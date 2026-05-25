import { MiniCheckpoint, type MiniCheckpointProps } from "@/components/lesson/mini-checkpoint";

export type LessonMiniCheckpointProps = MiniCheckpointProps;

/** @deprecated Используйте `MiniCheckpoint`. */
export function LessonMiniCheckpoint(props: LessonMiniCheckpointProps) {
  return <MiniCheckpoint {...props} />;
}
