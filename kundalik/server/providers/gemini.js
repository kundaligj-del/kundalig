const languageNames = { UZ: "o'zbek", EN: "ingliz", RU: "rus" };

export async function translateWithGemini({ text, source, target }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY sozlanmagan. `.env.local` faylida Google AI Studio kalitini kiriting.");

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  let upstream;
  try {
    upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Translate the text from ${languageNames[source]} to ${languageNames[target]}. Keep meaning and formatting. Return only the translation, no extra quotes or explanation.\n\n${text}` }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1200 },
        }),
        signal: AbortSignal.timeout(20_000),
      },
    );
  } catch {
    throw new Error("Hozir onlayn tarjima ishlamayapti, lug'atdan qidirib ko'ring.");
  }

  if (!upstream.ok) {
    throw new Error(upstream.status === 429
      ? "Tarjima xizmatining limiti tugadi. Birozdan so'ng qayta urinib ko'ring."
      : "Onlayn tarjima xizmati vaqtincha javob bermadi. Lug'atdan qidirib ko'ring.");
  }

  const payload = await upstream.json().catch(() => null);
  const translated = payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter((part) => typeof part === "string")
    .join("")
    .trim();
  if (!translated) throw new Error("Onlayn tarjima javobi bo'sh keldi. Lug'atdan qidirib ko'ring.");
  return translated;
}
