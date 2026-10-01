export type StudyPlanInput = {
  todayDate: string;
  tomorrowDate: string;
  currentTime: string;
  startAfter: string;
  lessons: string[];
  pendingHomework: { title: string; subject: string; dueDate: string | null }[];
};

export type StudyPlanItem = {
  start: string;
  end: string;
  title: string;
  subject: string | null;
  kind: "dars" | "vazifa" | "tanaffus";
  reason: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// AI yuborgan JSON ni ko'rsatishdan oldin tuzilmasi va vaqtlarini tekshiradi.
export function parseStudyPlan(value: string, startAfter: string): StudyPlanItem[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("Reja javobi JSON formatida emas. Qayta urinib ko'ring.");
  }
  if (!isRecord(parsed) || !Array.isArray(parsed.items) || parsed.items.length < 1 || parsed.items.length > 20) {
    throw new Error("Reja ma'lumotlari noto'g'ri. Qayta urinib ko'ring.");
  }

  let previousEnd = -1;
  const earliestStart = Number(startAfter.slice(0, 2)) * 60 + Number(startAfter.slice(3));
  const items = parsed.items.map((item): StudyPlanItem => {
    if (!isRecord(item)
      || typeof item.start !== "string" || !/^\d{2}:\d{2}$/.test(item.start)
      || typeof item.end !== "string" || !/^\d{2}:\d{2}$/.test(item.end)
      || typeof item.title !== "string" || !item.title.trim() || item.title.length > 120
      || !(item.subject === null || (typeof item.subject === "string" && item.subject.length <= 80))
      || (item.kind !== "dars" && item.kind !== "vazifa" && item.kind !== "tanaffus")
      || typeof item.reason !== "string" || item.reason.length > 200) {
      throw new Error("Reja kartochkasidagi ma'lumotlar noto'g'ri. Qayta urinib ko'ring.");
    }
    const start = Number(item.start.slice(0, 2)) * 60 + Number(item.start.slice(3));
    const end = Number(item.end.slice(0, 2)) * 60 + Number(item.end.slice(3));
    if (Number(item.start.slice(3)) > 59 || Number(item.end.slice(3)) > 59
      || start < earliestStart || start < 8 * 60 || end > 22 * 60
      || end <= start || end - start > 120 || start < previousEnd) {
      throw new Error("Rejadagi vaqtlar mos emas. Qayta urinib ko'ring.");
    }
    previousEnd = end;
    return {
      start: item.start,
      end: item.end,
      title: item.title.trim(),
      subject: item.subject,
      kind: item.kind,
      reason: item.reason,
    };
  });
  return items;
}

// Jadval va bajarilmagan vazifalarni serverga yuborib, AI rejasini oladi.
export async function requestStudyPlan(input: StudyPlanInput): Promise<StudyPlanItem[]> {
  let response: Response;
  try {
    response = await fetch("/api/study-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error("Reja serveriga ulanib bo'lmadi. `npm run dev:api` ishlayotganini tekshiring.");
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = isRecord(payload) && typeof payload.error === "string"
      ? payload.error : "Reja tuzib bo'lmadi. Qayta urinib ko'ring.";
    throw new Error(message);
  }
  if (!isRecord(payload) || typeof payload.plan !== "string") {
    throw new Error("Reja serveridan kutilmagan javob keldi.");
  }
  return parseStudyPlan(payload.plan, input.startAfter);
}
