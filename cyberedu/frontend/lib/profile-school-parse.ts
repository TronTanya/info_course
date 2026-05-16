/**
 * Разбор поля профиля «учебное заведение», если в конце указаны
 * «, группа …» и при необходимости «, N курс» (как в демо-данных).
 */
export function parseProfileEducationalInstitution(raw: string): {
  institution: string;
  group: string;
  courseYear: string;
} {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { institution: "—", group: "—", courseYear: "—" };
  }

  let s = trimmed;
  let courseYear = "—";
  const courseRe = /,\s*(\d{1,2})\s*курс\s*$/iu;
  const cm = s.match(courseRe);
  if (cm?.index !== undefined) {
    courseYear = String(parseInt(cm[1]!, 10));
    s = s.slice(0, cm.index).trimEnd();
  }

  let group = "—";
  const groupRe = /,\s*группа\s+([^,]+?)\s*$/iu;
  const gm = s.match(groupRe);
  if (gm?.index !== undefined) {
    group = (gm[1] ?? "").trim() || "—";
    s = s.slice(0, gm.index).trimEnd();
  }

  const institution = s.trim() || trimmed;
  return { institution, group, courseYear };
}
