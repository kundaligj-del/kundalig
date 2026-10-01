// O'quvchi profili, dars vaqtlari va streak yozuvining andozalari.
import { bellSchedule } from "@/data/bellSchedule";

export type StudentProfile = {
  name: string;
  school: string;
  grade: string;
};

export type ClassPeriod = {
  start: number;
  end: number;
};

export type StudyProgress = {
  streak: number;
  lastCompletedDate: string | null;
};

export const defaultProfile: StudentProfile = {
  name: "",
  school: "77-maktab",
  grade: '11 "A" sinfi',
};

export const defaultPeriods: ClassPeriod[] = Array.from({ length: 6 }, (_, index) => ({
  start: parseClock(bellSchedule[index].boshlanish),
  end: parseClock(bellSchedule[index].tugash),
}));

export function isLegacyDefaultPeriods(periods: ClassPeriod[]): boolean {
  return periods.length === 6 && periods.every((period, index) =>
    period.start === 8 * 60 + index * 50 && period.end === 8 * 60 + index * 50 + 45,
  );
}

export const defaultProgress: StudyProgress = { streak: 0, lastCompletedDate: null };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isStudentProfile(value: unknown): value is StudentProfile {
  return isRecord(value)
    && typeof value.name === "string"
    && typeof value.school === "string"
    && typeof value.grade === "string";
}

function isClassPeriod(value: unknown): value is ClassPeriod {
  return isRecord(value)
    && typeof value.start === "number"
    && Number.isInteger(value.start)
    && value.start >= 0
    && value.start < 1440
    && typeof value.end === "number"
    && Number.isInteger(value.end)
    && value.end > value.start
    && value.end < 1440;
}

export function isClassPeriodList(value: unknown): value is ClassPeriod[] {
  if (!Array.isArray(value) || value.length !== 6) return false;
  for (const period of value) {
    if (!isClassPeriod(period)) return false;
  }
  return true;
}

export function isStudyProgress(value: unknown): value is StudyProgress {
  return isRecord(value)
    && typeof value.streak === "number"
    && Number.isInteger(value.streak)
    && value.streak >= 0
    && (typeof value.lastCompletedDate === "string" || value.lastCompletedDate === null);
}

export function isColorTheme(value: unknown): value is "light" | "dark" {
  return value === "light" || value === "dark";
}

export function getSystemColorTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function formatClock(minutes: number): string {
  const hours = Math.floor(minutes / 60).toString().padStart(2, "0");
  const remainder = (minutes % 60).toString().padStart(2, "0");
  return `${hours}:${remainder}`;
}

export function parseClock(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}
