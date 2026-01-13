export function formatScriptureReference(
  book: string,
  chapter: number | null,
  startVerse: number | null,
  endVerse: number | null
): string {
  const safeBook = typeof book === "string" ? book.trim() : "";
  const safeChapter =
    typeof chapter === "number" && Number.isFinite(chapter)
      ? String(chapter)
      : "";
  const safeStart =
    typeof startVerse === "number" && Number.isFinite(startVerse)
      ? Math.trunc(startVerse)
      : null;
  const safeEnd =
    typeof endVerse === "number" && Number.isFinite(endVerse)
      ? Math.trunc(endVerse)
      : null;

  if (safeBook && safeChapter && safeStart && safeEnd) {
    const range =
      safeStart === safeEnd ? `${safeStart}` : `${safeStart}-${safeEnd}`;
    return `${safeBook} ${safeChapter}:${range}`;
  }
  if (safeBook && safeChapter && safeStart) {
    return `${safeBook} ${safeChapter}:${safeStart}`;
  }
  if (safeBook && safeChapter) {
    return `${safeBook} ${safeChapter}`;
  }
  return safeBook;
}
