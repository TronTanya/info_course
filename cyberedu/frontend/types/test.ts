export type QuestionType = "single" | "multiple";

export type TestQuestionStub = {
  id: string;
  prompt: string;
  type: QuestionType;
};
