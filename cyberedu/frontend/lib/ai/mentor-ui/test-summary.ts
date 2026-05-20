/** Краткий итог теста для панели контекста (без правильных ответов). */
export function formatMentorTestSummary(opts: {
  title: string;
  percent: number;
  passed: boolean;
  correctCount?: number;
  totalGraded?: number;
}): string {
  const status = opts.passed ? "зачтён" : "не зачтён";
  const base = `Тест «${opts.title}»: ${opts.percent}% (${status})`;
  if (opts.correctCount != null && opts.totalGraded != null && opts.totalGraded > 0) {
    return `${base} · верно ${opts.correctCount}/${opts.totalGraded}`;
  }
  return base;
}
