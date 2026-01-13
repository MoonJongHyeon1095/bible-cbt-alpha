type GetBibleFetchOptions = {
  englishBook: string;
  chapter: number;
  startVerse: number;
  endVerse: number;
};

export type BibleVerseEntry = {
  verse: number;
  text: string;
};

type GetBibleChapterOptions = {
  bookNumber: number;
  chapter: number;
};

const normalizeVerseText = (text: string) =>
  text.replace(/\s+/g, " ").trim();

const extractVerseText = (verse: unknown): string => {
  if (!verse || typeof verse !== "object") return "";
  const record = verse as Record<string, unknown>;
  const candidate =
    record.text ??
    record.content ??
    record.verse ??
    record.verse_text ??
    record.verseText ??
    record.body ??
    "";
  return typeof candidate === "string" ? normalizeVerseText(candidate) : "";
};

const extractVerses = (data: unknown): string[] => {
  if (!data || typeof data !== "object") return [];
  const record = data as Record<string, unknown>;
  const nestedRecord = Object.values(record).find(
    (value) =>
      value &&
      typeof value === "object" &&
      Array.isArray((value as Record<string, unknown>).verses)
  ) as Record<string, unknown> | undefined;
  const candidates = [
    record.verses,
    (record.data as Record<string, unknown> | undefined)?.verses,
    record.data,
    (record.verses as Record<string, unknown> | undefined)?.data,
    nestedRecord?.verses,
  ];
  const verseArray = candidates.find((value) => Array.isArray(value)) as
    | unknown[]
    | undefined;
  if (!verseArray) return [];
  return verseArray
    .map((verse) => extractVerseText(verse))
    .filter((text) => text.length > 0);
};

const extractVerseEntries = (data: unknown): BibleVerseEntry[] => {
  if (!data || typeof data !== "object") return [];
  const record = data as Record<string, unknown>;
  const nestedRecord = Object.values(record).find(
    (value) =>
      value &&
      typeof value === "object" &&
      Array.isArray((value as Record<string, unknown>).verses)
  ) as Record<string, unknown> | undefined;
  const candidates = [
    record.verses,
    (record.data as Record<string, unknown> | undefined)?.verses,
    nestedRecord?.verses,
  ];
  const verseArray = candidates.find((value) => Array.isArray(value)) as
    | Array<Record<string, unknown>>
    | undefined;
  if (!verseArray) return [];

  return verseArray
    .map((verse) => {
      const text = extractVerseText(verse);
      const num = Number((verse as Record<string, unknown>).verse);
      return {
        verse: Number.isFinite(num) ? num : 0,
        text,
      };
    })
    .filter((entry) => entry.verse > 0 && entry.text.length > 0);
};

export async function fetchGetBibleVerses({
  englishBook,
  chapter,
  startVerse,
  endVerse,
}: GetBibleFetchOptions): Promise<string[]> {
  const range = startVerse === endVerse ? `${startVerse}` : `${startVerse}-${endVerse}`;
  const reference = `${englishBook} ${chapter}:${range}`;
  const url = `https://query.getbible.net/v2/korean/${encodeURIComponent(reference)}`;
  const response = await fetch(url);
  if (!response.ok) {
    let message = `getBible failed: ${response.status}`;
    try {
      const data = (await response.json()) as { error?: string };
      if (data?.error) {
        message = data.error;
      }
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  const data = (await response.json()) as unknown;
  const verses = extractVerses(data);
  return verses;
}

export async function fetchGetBibleChapter({
  bookNumber,
  chapter,
}: GetBibleChapterOptions): Promise<BibleVerseEntry[]> {
  const url = `https://api.getbible.net/v2/korean/${bookNumber}/${chapter}.json`;
  const response = await fetch(url);
  if (!response.ok) {
    let message = `getBible failed: ${response.status}`;
    try {
      const data = (await response.json()) as { error?: string };
      if (data?.error) {
        message = data.error;
      }
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  const data = (await response.json()) as unknown;
  return extractVerseEntries(data);
}
