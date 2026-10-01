import { smallTalk, type SmallTalkTopic } from "@/data/smallTalk";

export function normalizeText(value: string): string {
  return value
    .toLocaleLowerCase("uz")
    .replace(/o[ʻ’‘`´']/g, "o'")
    .replace(/g[ʻ’‘`´']/g, "g'")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}'\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function editDistance(left: string, right: string): number {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const previous = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (left[i - 1] === right[j - 1] ? 0 : 1));
      diagonal = previous;
    }
  }
  return row[right.length];
}

function fuzzyContains(normalizedText: string, normalizedKey: string): boolean {
  if (normalizedText.includes(normalizedKey)) return true;
  if (normalizedKey.includes(" ")) return false;
  return normalizedText.split(" ").some((word) =>
    word.length >= 4 && Math.abs(word.length - normalizedKey.length) <= 1
      && editDistance(word, normalizedKey) <= 1,
  );
}

export function matchSmallTalk(input: string): SmallTalkTopic[] {
  const normalized = normalizeText(input);
  return smallTalk.filter((topic) =>
    topic.kalitlar.some((key) => fuzzyContains(normalized, normalizeText(key))),
  );
}

export function findFuzzyMatch<T>(input: string, options: readonly T[], label: (item: T) => string): T | undefined {
  const normalized = normalizeText(input);
  return options.find((item) => {
    const candidate = normalizeText(label(item));
    return normalized === candidate || fuzzyContains(normalized, candidate);
  });
}
