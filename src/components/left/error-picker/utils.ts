export function splitToSentences(text: string): string[] {
  if (!text) return [];

  const decoded = text
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t");

  const normalized = decoded
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .trim();

  const parts = normalized
    .split(/(?<=[.!?])\s+(?=[^)\]"'”’\s])/g)
    .map((s) => s.trim())
    .filter(Boolean);

  return parts.length ? parts : [normalized];
}
