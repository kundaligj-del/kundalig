export type LessonCount = {
  subject: string;
  total: number;
  thisWeek: number;
};

type ScheduleDay = {
  fanlar: readonly string[];
};

function parseDateKey(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Sana YYYY-MM-DD formatida bo'lishi kerak.");
  }
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(0);
  parsed.setFullYear(year, month - 1, day);
  parsed.setHours(12, 0, 0, 0);
  if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
    throw new Error("Kalendar sanasi noto'g'ri.");
  }
  return parsed;
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// Darslarni sana oralig'i bo'yicha sanaydi; yakshanba va dam olish kunlarini tashlab ketadi.
export function countLessonsBySubject(
  schedule: readonly ScheduleDay[],
  schoolYearStart: string,
  throughDate: Date,
  daysOff: readonly string[],
): LessonCount[] {
  const startDate = parseDateKey(schoolYearStart);
  const endDate = new Date(throughDate);
  endDate.setHours(12, 0, 0, 0);
  const dayOffSet = new Set(daysOff);

  for (const date of dayOffSet) parseDateKey(date);

  const counts = new Map<string, LessonCount>();
  for (const day of schedule) {
    for (const subject of day.fanlar) {
      if (!counts.has(subject)) counts.set(subject, { subject, total: 0, thisWeek: 0 });
    }
  }

  const weekStart = new Date(endDate);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const weekStartKey = dateKey(weekStart);

  for (const date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const key = dateKey(date);
    const dayIndex = (date.getDay() + 6) % 7;
    if (dayIndex >= schedule.length || dayOffSet.has(key)) continue;

    for (const subject of schedule[dayIndex].fanlar) {
      const count = counts.get(subject);
      if (!count) continue;
      count.total += 1;
      if (key >= weekStartKey) count.thisWeek += 1;
    }
  }

  return [...counts.values()].sort((a, b) => b.total - a.total);
}
