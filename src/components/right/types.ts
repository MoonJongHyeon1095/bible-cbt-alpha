export type AlternativeThought = {
  thought: string;
  technique: string;
  techniqueDescription: string;
};

export type BibleVerseResult = {
  book: string;
  chapter: number | null;
  startVerse: number | null;
  endVerse: number | null;
  verse: string;
  prayer: string;
};
