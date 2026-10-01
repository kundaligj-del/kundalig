import { addDays, getDateKey, isDateKey } from "@/data/calendar";

export type WeakTopic = {
  id: string;
  subject: string;
  topic: string;
  wrongAttempts: number;
  reviewStep: number;
  lastErrorAt: string;
  nextReviewDate: string | null;
  questionIds: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// LocalStorage'dan kelgan zaif mavzular ma'lumotini ishlatishdan oldin tekshiradi.
export function isWeakTopicList(value: unknown): value is WeakTopic[] {
  return Array.isArray(value) && value.length <= 100 && value.every((item: unknown) =>
    isRecord(item)
    && typeof item.id === "string"
    && typeof item.subject === "string"
    && typeof item.topic === "string"
    && typeof item.wrongAttempts === "number"
    && Number.isInteger(item.wrongAttempts)
    && item.wrongAttempts >= 1
    && typeof item.reviewStep === "number"
    && Number.isInteger(item.reviewStep)
    && item.reviewStep >= 0
    && item.reviewStep <= 3
    && typeof item.lastErrorAt === "string"
    && !Number.isNaN(Date.parse(item.lastErrorAt))
    && (item.nextReviewDate === null || isDateKey(item.nextReviewDate))
    && Array.isArray(item.questionIds)
    && item.questionIds.every((id: unknown) => typeof id === "string"),
  );
}

function dateAfter(date: Date, days: number): string {
  return getDateKey(addDays(date, days));
}

// Xato bo'lgan mavzuni ertangi takrorlash ro'yxatiga qo'shadi.
export function recordWeakTopicFailure(
  current: WeakTopic[],
  subject: string,
  topic: string,
  questionIds: string[] = [],
  now = new Date(),
): WeakTopic[] {
  const id = `${subject}:${topic}`;
  const existing = current.find((item) => item.id === id);
  const next: WeakTopic = {
    id,
    subject,
    topic,
    wrongAttempts: (existing?.wrongAttempts ?? 0) + 1,
    reviewStep: 0,
    lastErrorAt: now.toISOString(),
    nextReviewDate: dateAfter(now, 1),
    questionIds: [...new Set([...(existing?.questionIds ?? []), ...questionIds])].slice(-100),
  };
  return [...current.filter((item) => item.id !== id), next].slice(-100);
}

// Mavzu 1, 3 va 7 kunlik takrorlardan o'tsa, navbatdagi sanani belgilaydi.
export function recordWeakTopicSuccess(
  current: WeakTopic[],
  id: string,
  now = new Date(),
): WeakTopic[] {
  return current.map((item) => {
    if (item.id !== id) return item;
    const reviewStep = Math.min(3, item.reviewStep + 1);
    const gapDays = reviewStep === 1 ? 3 : reviewStep === 2 ? 7 : null;
    return {
      ...item,
      reviewStep,
      nextReviewDate: gapDays === null ? null : dateAfter(now, gapDays),
    };
  });
}

// Bugun yoki oldin qaytarilishi kerak bo'lgan mavzularni topadi.
export function getDueWeakTopics(items: WeakTopic[], today: string): WeakTopic[] {
  return items
    .filter((item) => item.nextReviewDate !== null && item.nextReviewDate <= today)
    .sort((first, second) => (first.nextReviewDate ?? "").localeCompare(second.nextReviewDate ?? ""));
}
