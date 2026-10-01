import { localDateKey } from "@/data/preferences";

export type DayOff = {
  date: string;
  label: string;
};

export type CalendarSettings = {
  schoolYearStart: string;
}

const uzMonths = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
];
const uzWeekdays = ["yakshanba", "dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isDateKey(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function getDefaultCalendarSettings(): CalendarSettings {
  const current = new Date();
  const schoolYear = current.getMonth() >= 8 ? current.getFullYear() : current.getFullYear() - 1;
  return { schoolYearStart: localDateKey(new Date(schoolYear, 8, 1)) };
}

export function isCalendarSettings(value: unknown): value is CalendarSettings {
  return isRecord(value) && isDateKey(value.schoolYearStart);
}

export function isDayOffList(value: unknown): value is DayOff[] {
  return Array.isArray(value) && value.every((item: unknown) =>
    isRecord(item)
    && isDateKey(item.date)
    && typeof item.label === "string"
    && item.label.trim().length > 0,
  );
}

export const defaultCalendarSettings = getDefaultCalendarSettings();

export function getDateKey(date: Date): string {
  return localDateKey(date);
}

export function daysBetweenDateKeys(start: string, end: string): number {
  if (!isDateKey(start) || !isDateKey(end)) throw new Error("Sana YYYY-MM-DD formatida bo'lishi kerak.");
  const [startYear, startMonth, startDay] = start.split("-").map(Number);
  const [endYear, endMonth, endDay] = end.split("-").map(Number);
  const startUtc = Date.UTC(startYear, startMonth - 1, startDay);
  const endUtc = Date.UTC(endYear, endMonth - 1, endDay);
  return (endUtc - startUtc) / 86_400_000;
}

export function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function getMonthGrid(month: Date): Date[] {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cellCount = Math.ceil((offset + daysInMonth) / 7) * 7;
  const gridStart = addDays(firstDay, -offset);
  return Array.from({ length: cellCount }, (_, index) => addDays(gridStart, index));
}

export function getSchoolDayIndex(date: Date): number {
  const index = (date.getDay() + 6) % 7;
  return index < 6 ? index : -1;
}

export function formatUzDate(date: Date, options: Intl.DateTimeFormatOptions = {}): string {
  const weekday = options.weekday ? `${uzWeekdays[date.getDay()]}, ` : "";
  return `${weekday}${date.getDate()}-${uzMonths[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatUzMonth(date: Date): string {
  const month = uzMonths[date.getMonth()];
  return `${month.charAt(0).toLocaleUpperCase("uz-UZ")}${month.slice(1)} ${date.getFullYear()}`;
}
