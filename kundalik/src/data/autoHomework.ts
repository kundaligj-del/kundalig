// Avtomatik vazifa sozlamalari va oxirgi natijani saqlash shakllari.
import { isDateKey } from "@/data/calendar";

export type AutoHomeworkDifficulty = "oson" | "aralash" | "qiyin";
export type AutoHomeworkSettings = {
  enabled: boolean;
  time: string;
  tasksPerSubject: 1 | 2;
  difficulty: AutoHomeworkDifficulty;
  excludedSubjects: string[];
  maxMinutes: number;
  browserNotifications: boolean;
};
export type AutoHomeworkNotice = {
  id: string;
  targetDate: string;
  weekday: string;
  taskCount: number;
  totalMinutes: number;
  message: string;
  kind?: "success" | "failure" | "fallback";
};
export type AutoHomeworkFailure = {
  targetDate: string;
  attempts: number;
  nextAttemptAt: number;
  message: string;
};

export const defaultAutoHomeworkSettings: AutoHomeworkSettings = {
  enabled: true,
  time: "18:00",
  tasksPerSubject: 1,
  difficulty: "aralash",
  excludedSubjects: [],
  maxMinutes: 120,
  browserNotifications: false,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isAutoHomeworkSettings(value: unknown): value is AutoHomeworkSettings {
  return isRecord(value)
    && typeof value.enabled === "boolean"
    && typeof value.time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value.time)
    && (value.tasksPerSubject === 1 || value.tasksPerSubject === 2)
    && (value.difficulty === "oson" || value.difficulty === "aralash" || value.difficulty === "qiyin")
    && Array.isArray(value.excludedSubjects) && value.excludedSubjects.every((item) => typeof item === "string")
    && typeof value.maxMinutes === "number" && Number.isInteger(value.maxMinutes) && value.maxMinutes >= 60 && value.maxMinutes <= 180
    && typeof value.browserNotifications === "boolean";
}

export function isAutoHomeworkNotice(value: unknown): value is AutoHomeworkNotice | null {
  if (value === null) return true;
  return isRecord(value)
    && typeof value.id === "string" && isDateKey(value.targetDate)
    && typeof value.weekday === "string" && typeof value.taskCount === "number"
    && typeof value.totalMinutes === "number" && typeof value.message === "string";
}

export function isAutoHomeworkFailure(value: unknown): value is AutoHomeworkFailure | null {
  if (value === null) return true;
  return isRecord(value) && isDateKey(value.targetDate)
    && typeof value.attempts === "number" && Number.isInteger(value.attempts)
    && typeof value.nextAttemptAt === "number" && typeof value.message === "string";
}
