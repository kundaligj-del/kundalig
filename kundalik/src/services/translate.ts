import {
  dictionary,
  type DictionaryEntry,
  type TranslatorLanguage,
} from "@/data/dictionary";

type TranslationResponse = {
  translation?: unknown;
  translatedText?: unknown;
  result?: unknown;
};

type ErrorResponse = { error?: unknown };
export type OnlineLanguage = "UZ" | "EN" | "RU";

export function findDictionaryEntries(
  query: string,
  language?: TranslatorLanguage,
): DictionaryEntry[] {
  const normalizedQuery = normalizeLookupText(query);
  if (normalizedQuery.length < 2) return [];

  const languages: TranslatorLanguage[] = language ? [language] : ["uz", "en", "ru"];
  return dictionary
    .map((entry) => {
      const terms = languages.map((item) => normalizeLookupText(entry[item]));
      const score = Math.max(0, ...terms.map((term) => {
        if (term === normalizedQuery) return 3;
        if (normalizedQuery.startsWith(`${term} `) || normalizedQuery.endsWith(` ${term}`)) return 2;
        if (normalizedQuery.includes(` ${term} `)) return 2;
        if (term.length >= 3 && (term.includes(normalizedQuery) || normalizedQuery.includes(term))) return 1;
        if (!term.includes(" ") && !normalizedQuery.includes(" ")
          && term.length >= 4 && Math.abs(term.length - normalizedQuery.length) <= 1
          && editDistance(term, normalizedQuery) <= 1) return 1;
        return 0;
      }));
      return { entry, score };
    })
    .filter(({ score }) => score > 0)
    .sort((first, second) => second.score - first.score)
    .slice(0, 20)
    .map(({ entry }) => entry);
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

function normalizeLookupText(value: string): string {
  return value.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[ʻ’‘`]/g, "'").replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function translateOnline(
  text: string,
  source: OnlineLanguage,
  target: OnlineLanguage,
  signal?: AbortSignal,
): Promise<string> {
  let response: Response;
  try {
    response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, source, target }),
      signal,
    });
  } catch (reason) {
    if (signal?.aborted) throw reason;
    throw new Error("Onlayn tarjima hozir ishlamayapti, lug'atdan qidirib ko'ring.");
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const reason = isRecord(payload) ? (payload as ErrorResponse).error : undefined;
    if (response.status >= 500 && !(typeof reason === "string" && (/GEMINI_API_KEY|limit/i).test(reason))) {
      throw new Error("Onlayn tarjima hozir ishlamayapti, lug'atdan qidirib ko'ring.");
    }
    throw new Error(typeof reason === "string" && reason.trim()
      ? reason : "Onlayn tarjima hozir ishlamayapti, lug'atdan qidirib ko'ring.");
  }

  if (isRecord(payload)) {
    const result = (payload as TranslationResponse).translation
      ?? (payload as TranslationResponse).translatedText
      ?? (payload as TranslationResponse).result;
    if (typeof result === "string" && result.trim()) return result.trim();
  }
  throw new Error("Tarjima xizmati tushunarsiz javob qaytardi. Qayta urinib ko'ring.");
}
