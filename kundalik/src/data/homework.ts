// Uy vazifasining tuzilishi va localStorage dan o'qilgan ma'lumotni tekshirish.
export type HomeworkItem = {
  id: string;
  title: string;
  subject: string;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
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
    && (typeof item.dueDate === "string" || item.dueDate === null)
    && typeof item.completed === "boolean"
    && typeof item.createdAt === "string",
  );
}
