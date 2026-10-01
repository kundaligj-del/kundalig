export const writingSubjects = ["Adabiyot", "Ona tili", "Ingliz tili", "Rus tili"] as const;
export type WritingSubject = typeof writingSubjects[number];

type WritingReview = {
  baho: number;
  grammatika: string;
  uslub: string;
  tuzilish: string;
  yaxshilashlar: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// Serverdan kelgan JSON hisobotini chatga chiqarishdan avval tekshiradi.
function parseReview(value: string): WritingReview {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("Yozma ish tahlili noto'g'ri formatda keldi. Qayta urinib ko'r.");
  }
  if (!isRecord(parsed)
    || typeof parsed.baho !== "number" || !Number.isInteger(parsed.baho) || parsed.baho < 0 || parsed.baho > 100
    || typeof parsed.grammatika !== "string" || !parsed.grammatika.trim() || parsed.grammatika.length > 1000
    || typeof parsed.uslub !== "string" || !parsed.uslub.trim() || parsed.uslub.length > 1000
    || typeof parsed.tuzilish !== "string" || !parsed.tuzilish.trim() || parsed.tuzilish.length > 1000
    || !Array.isArray(parsed.yaxshilashlar) || parsed.yaxshilashlar.length < 1 || parsed.yaxshilashlar.length > 5
    || !parsed.yaxshilashlar.every((item) => typeof item === "string" && item.trim().length > 0 && item.length <= 240)) {
    throw new Error("Yozma ish tahlili ma'lumotlari tekshiruvdan o'tmadi. Qayta urinib ko'r.");
  }
  return {
    baho: parsed.baho,
    grammatika: parsed.grammatika,
    uslub: parsed.uslub,
    tuzilish: parsed.tuzilish,
    yaxshilashlar: parsed.yaxshilashlar,
  };
}

// Yozma ishni OpenAI kalitini ko'rmaydigan, server orqali tekshirtiradi.
export async function requestWritingReview(subject: WritingSubject, text: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch("/api/writing-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, text }),
    });
  } catch {
    throw new Error("Tekshirish serveriga ulanib bo'lmadi. `npm run dev:api` ishlayotganini tekshir.");
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(isRecord(payload) && typeof payload.error === "string"
      ? payload.error : "Yozma ishni hozir tekshirib bo'lmadi.");
  }
  if (!isRecord(payload) || typeof payload.review !== "string") {
    throw new Error("Tekshirish serveridan kutilmagan javob keldi.");
  }

  const review = parseReview(payload.review);
  return [
    `### ${subject} · yozma ish tahlili`,
    `**Umumiy baho:** ${review.baho}/100`,
    `**Grammatika:** ${review.grammatika}`,
    `**Uslub:** ${review.uslub}`,
    `**Tuzilish:** ${review.tuzilish}`,
    "**O'zing yaxshilab ko'r:**",
    ...review.yaxshilashlar.map((item) => `- ${item}`),
    "",
    "_Matnni to'liq yozib bermadim — shu maslahatlar bilan o'zing tahrirlab ko'r!_",
  ].join("\n\n");
}
