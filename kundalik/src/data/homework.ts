// Uy vazifasining tuzilishi va localStorage dan o'qilgan ma'lumotni tekshirish.
import { isDateKey } from "@/data/calendar";

export type HomeworkItem = {
  id: string;
  title: string;
  subject: string;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
  difficulty?: "oson" | "orta" | "qiyin";
  estimatedMinutes?: number;
  taskType?: string;
  source?: "mitticha";
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isHomeworkList(value: unknown): value is HomeworkItem[] {
  return Array.isArray(value) && value.every((item: unknown) =>
    isRecord(item)
    && typeof item.id === "string"
    && typeof item.title === "string"
    && typeof item.subject === "string"
    && (item.dueDate === null || isDateKey(item.dueDate))
    && typeof item.completed === "boolean"
    && typeof item.createdAt === "string"
    && (!("difficulty" in item) || item.difficulty === "oson" || item.difficulty === "orta" || item.difficulty === "qiyin")
    && (!("estimatedMinutes" in item)
      || (typeof item.estimatedMinutes === "number"
        && Number.isInteger(item.estimatedMinutes)
        && item.estimatedMinutes >= 5
        && item.estimatedMinutes <= 120))
    && (!("taskType" in item) || (typeof item.taskType === "string" && item.taskType.length <= 100))
    && (!("source" in item) || item.source === "mitticha"),
  );
}
