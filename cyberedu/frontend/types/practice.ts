export type PracticeKind = "INTERACTIVE" | "TEXT" | "FILE_UPLOAD";

export type PracticeTaskStub = {
  id: string;
  title: string;
  kind: PracticeKind;
};
