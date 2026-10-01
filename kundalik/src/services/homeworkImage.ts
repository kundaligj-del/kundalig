const MAX_IMAGE_DATA_URL_LENGTH = 950_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// Suratni API kaliti oshkor bo'lmaydigan serverga yuborib, yo'naltiruvchi javob oladi.
export async function requestHomeworkImage(imageDataUrl: string): Promise<string> {
  if (imageDataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
    throw new Error("Kichraytirilgan rasm ham katta chiqdi. Boshqa, kichikroq surat tanlab ko'r.");
  }

  let response: Response;
  try {
    response = await fetch("/api/homework-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageDataUrl }),
    });
  } catch {
    throw new Error("Rasm tahlili serveriga ulanib bo'lmadi. `npm run dev:api` ishlayotganini tekshir.");
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(isRecord(payload) && typeof payload.error === "string"
      ? payload.error : "Rasmdagi vazifani hozir o'qib bo'lmadi.");
  }
  if (!isRecord(payload) || typeof payload.explanation !== "string"
    || !payload.explanation.trim() || payload.explanation.length > 4000) {
    throw new Error("Rasm tahlili serveridan kutilmagan javob keldi.");
  }
  return payload.explanation.trim();
}
