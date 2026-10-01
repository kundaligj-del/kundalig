import { addDays, getDateKey, getSchoolDayIndex, type DayOff } from "@/data/calendar";
import type { AutoHomeworkSettings } from "@/data/autoHomework";
import { getSubjectTaskType } from "@/data/subjectTaskTypes";
import { week } from "@/data/schedule";

export type NextSchoolDay = {
  date: Date;
  dateKey: string;
  weekday: string;
  lessons: string[];
};

export type AutoHomeworkPrompt = {
  targetDate: string;
  weekday: string;
  maxMinutes: number;
  tasksPerSubject: 1 | 2;
  difficulty: AutoHomeworkSettings["difficulty"];
  lessons: { fan: string; tur: string; "ko'rsatma": string; oxirgiMavzu: string | null; "o'tilganDarslar": number; zaxira: string; yengil: boolean }[];
};

const weekdayNames = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];

// Bugungi kundan keyingi birinchi o'quv kunini topadi, dam olish sanalarini tashlab o'tadi.
export function getNextSchoolDay(from: Date, daysOff: readonly DayOff[]): NextSchoolDay {
  for (let offset = 1; offset <= 21; offset += 1) {
    const date = addDays(from, offset);
    const dayIndex = getSchoolDayIndex(date);
    if (dayIndex < 0 || daysOff.some((item) => item.date === getDateKey(date))) continue;
    const lessons = [...new Set(week[dayIndex].fanlar)];
    return { date, dateKey: getDateKey(date), weekday: weekdayNames[date.getDay()], lessons };
  }
  throw new Error("Keyingi o'quv kuni topilmadi. Kalendar sozlamalarini tekshiring.");
}

// Reja va sozlamaga qarab 18:00 bo'lganini yoki qo'lda chaqirilganini tekshiradi.
export function shouldGenerateNow(
  now: Date,
  settings: AutoHomeworkSettings,
  force = false,
): boolean {
  if (force) return true;
  if (!settings.enabled) return false;
  const [hour, minute] = settings.time.split(":").map(Number);
  return now.getHours() * 60 + now.getMinutes() >= hour * 60 + minute;
}

// Bitta so'rovga ertangi barcha fanlar, o'tilgan mavzu va darslar sonini yig'adi.
export function buildPrompt(
  nextDay: NextSchoolDay,
  settings: AutoHomeworkSettings,
  excludedSubjects: readonly string[],
  lastTopics: Record<string, string>,
  lessonCounts: Record<string, number>,
): AutoHomeworkPrompt {
  const lessons = nextDay.lessons
    .filter((fan) => !excludedSubjects.includes(fan))
    .map((fan) => {
      const task = getSubjectTaskType(fan);
      return {
        fan,
        tur: task.tur,
        "ko'rsatma": task.instruction,
        oxirgiMavzu: lastTopics[fan]?.trim() || null,
        "o'tilganDarslar": lessonCounts[fan] ?? 0,
        zaxira: task.zaxira,
        yengil: task.yengil ?? false,
      };
    });
  return {
    targetDate: nextDay.dateKey,
    weekday: nextDay.weekday,
    maxMinutes: settings.maxMinutes,
    tasksPerSubject: settings.tasksPerSubject,
    difficulty: settings.difficulty,
    lessons,
  };
}
