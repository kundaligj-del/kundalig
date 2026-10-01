import type { AutoHomeworkPrompt } from "@/utils/autoHomework";
import type { HomeworkItem } from "@/data/homework";

export type GeneratedAutoTask = {
  fan: string;
  tur: string;
  matn: string;
  qiyinlik: "oson" | "o'rta" | "qiyin";
  daqiqa: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// Server JSON javobini xavfsiz tekshirib, yetishmagan fanlarga andoza qo'shadi.
export function parseAutoHomeworkResponse(
  raw: string,
  prompt: AutoHomeworkPrompt,
): GeneratedAutoTask[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("AI javobi JSON formatida emas.");
  }
  if (!Array.isArray(parsed)) throw new Error("AI javobida vazifalar ro'yxati topilmadi.");

  const allowedSubjects = new Set(prompt.lessons.map((lesson) => lesson.fan));
  const tasks = parsed.filter((value): value is Record<string, unknown> => isRecord(value))
    .filter((value) => typeof value.fan === "string" && allowedSubjects.has(value.fan))
    .filter((value) => typeof value.tur === "string" && value.tur.length <= 100)
    .filter((value) => typeof value.matn === "string" && value.matn.trim().length > 0 && value.matn.length <= 400)
    .filter((value) => value.qiyinlik === "oson" || value.qiyinlik === "o'rta" || value.qiyinlik === "qiyin")
    .filter((value) => typeof value.daqiqa === "number" && Number.isInteger(value.daqiqa) && value.daqiqa >= 5 && value.daqiqa <= 60)
    .map((value) => ({
      fan: value.fan as string,
      tur: value.tur as string,
      matn: (value.matn as string).trim(),
      qiyinlik: value.qiyinlik as GeneratedAutoTask["qiyinlik"],
      daqiqa: value.daqiqa as number,
    }));

  for (const lesson of prompt.lessons) {
    const subjectTasks = tasks.filter((item) => item.fan === lesson.fan).slice(0, prompt.tasksPerSubject);
    if (subjectTasks.length === 0) {
      subjectTasks.push({
        fan: lesson.fan,
        tur: lesson.tur,
        matn: lesson.oxirgiMavzu
          ? `${lesson.zaxira} Mavzu: ${lesson.oxirgiMavzu}.`
          : `${lesson.zaxira} Mavzuni sozlamalarda kiritsang, keyingi vazifalar aniqroq bo'ladi.`,
        qiyinlik: "oson",
        daqiqa: lesson.yengil ? 5 : 12,
      });
    }
    for (const task of subjectTasks) {
      if (lesson.yengil) task.daqiqa = Math.min(10, task.daqiqa);
    }
    const indexes = tasks.map((item, index) => item.fan === lesson.fan ? index : -1).filter((index) => index >= 0);
    indexes.forEach((index) => { tasks[index] = subjectTasks.shift() ?? tasks[index]; });
    if (indexes.length === 0) tasks.push(...subjectTasks);
    if (!lesson.oxirgiMavzu) {
      const firstTask = tasks.find((item) => item.fan === lesson.fan);
      if (firstTask && !firstTask.matn.includes("Mavzuni sozlamalarda kiritsang")) {
        firstTask.matn = `${firstTask.matn} Mavzuni sozlamalarda kiritsang, keyingi vazifalar aniqroq bo'ladi.`;
      }
    }
  }

  const bySubject = prompt.lessons.flatMap((lesson) => tasks.filter((item) => item.fan === lesson.fan).slice(0, prompt.tasksPerSubject));
  const minimum = (_task: GeneratedAutoTask) => 5;
  let total = bySubject.reduce((sum, task) => sum + task.daqiqa, 0);
  while (total > prompt.maxMinutes) {
    const longest = bySubject
      .filter((task) => task.daqiqa > minimum(task))
      .sort((a, b) => b.daqiqa - a.daqiqa)[0];
    if (!longest) break;
    longest.daqiqa -= 1;
    total -= 1;
  }
  return bySubject;
}

// Avtomatik vazifalarni mavjud homework modeliga qo'shish uchun moslaydi.
export function toHomeworkItems(tasks: GeneratedAutoTask[], targetDate: string): HomeworkItem[] {
  const createdAt = new Date().toISOString();
  return tasks.map((task) => ({
    id: crypto.randomUUID(),
    subject: task.fan,
    title: task.matn,
    dueDate: targetDate,
    completed: false,
    createdAt,
    difficulty: task.qiyinlik === "o'rta" ? "orta" : task.qiyinlik,
    estimatedMinutes: task.daqiqa,
    taskType: task.tur,
    source: "mitticha",
  }));
}

export async function requestAutoHomework(prompt: AutoHomeworkPrompt): Promise<string> {
  let response: Response;
  try {
    response = await fetch("/api/auto-homework", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prompt),
    });
  } catch {
    throw new Error("Serverga ulanib bo'lmadi.");
  }
  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(isRecord(result) && typeof result.error === "string" ? result.error : "Vazifalarni tuzib bo'lmadi.");
  }
  if (!isRecord(result) || typeof result.tasks !== "string") {
    throw new Error("Serverdan noto'g'ri javob keldi.");
  }
  return result.tasks;
}
