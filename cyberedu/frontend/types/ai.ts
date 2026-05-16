export type AiMode = "chat" | "lecture_adaptation";

export type AiAdaptationResult = {
  original: string;
  adapted: string;
  createdAt: Date;
};
