import { getSchoolDayIndex, type DayOff } from "@/data/calendar";
import { katta_tanaffus } from "@/data/bellSchedule";
import { defaultPeriods, formatClock, localDateKey, parseClock, type ClassPeriod } from "@/data/preferences";
import { week } from "@/data/schedule";

export type BellStatus =
  | { holat: "darsdan_oldin"; fan: string; darsRaqami: number; boshlanish: string; qolganDaqiqa: number }
  | { holat: "dars_davom_etmoqda"; fan: string; darsRaqami: number; tugash: string; qolganDaqiqa: number; keyingiFan: string | null }
  | { holat: "katta_tanaffus"; fan: string; darsRaqami: number; boshlanish: string; tanaffusTugashi: string }
  | { holat: "darslar_tugadi" }
  | { holat: "dam_olish_kuni"; keyingiFan: string | null; keyingiSana: string | null };

type NextSchoolDay = { fan: string; sana: string };

function minutesUntil(clock: number, date: Date): number {
  const exactCurrentMinute = date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
  return Math.max(0, Math.ceil(clock - exactCurrentMinute));
}

function nextSchoolDay(from: Date, daysOff: DayOff[]): NextSchoolDay | null {
  const date = new Date(from);
  for (let offset = 1; offset <= 14; offset += 1) {
    date.setDate(date.getDate() + 1);
    if (getSchoolDayIndex(date) < 0 || daysOff.some((day) => day.date === localDateKey(date))) continue;
    const nextDay = week[getSchoolDayIndex(date)];
    const fan = nextDay?.fanlar[0];
    if (fan) return { fan, sana: localDateKey(date) };
  }
  return null;
}

// Mahalliy vaqt, haftalik darslar va dam olish kunlariga qarab hozirgi dars holatini topadi.
export function getCurrentStatus(
  date = new Date(),
  periods: ClassPeriod[] = defaultPeriods,
  daysOff: DayOff[] = [],
): BellStatus {
  const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const dayOff = daysOff.some((day) => day.date === dateKey);
  const dayIndex = getSchoolDayIndex(date);
  if (dayOff || dayIndex < 0) {
    const next = nextSchoolDay(date, daysOff);
    return { holat: "dam_olish_kuni", keyingiFan: next?.fan ?? null, keyingiSana: next?.sana ?? null };
  }

  const lessons = week[dayIndex].fanlar;
  const activePeriods = periods.slice(0, lessons.length);
  const currentMinute = date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;

  for (let index = 0; index < activePeriods.length; index += 1) {
    const period = activePeriods[index];
    if (currentMinute >= period.start && currentMinute < period.end) {
      return {
        holat: "dars_davom_etmoqda",
        fan: lessons[index],
        darsRaqami: index + 1,
        tugash: formatClock(period.end),
        qolganDaqiqa: minutesUntil(period.end, date),
        keyingiFan: lessons[index + 1] ?? null,
      };
    }
  }

  const nextIndex = activePeriods.findIndex((period) => period.start > currentMinute);
  if (nextIndex === 0) {
    return {
      holat: "darsdan_oldin",
      fan: lessons[0],
      darsRaqami: 1,
      boshlanish: formatClock(activePeriods[0].start),
      qolganDaqiqa: minutesUntil(activePeriods[0].start, date),
    };
  }
  if (nextIndex > 0) {
    const previousPeriod = activePeriods[nextIndex - 1];
    const nextPeriod = activePeriods[nextIndex];
    if (currentMinute >= previousPeriod.end && currentMinute < nextPeriod.start) {
      const breakStart = parseClock(katta_tanaffus.boshlanish);
      const breakEnd = parseClock(katta_tanaffus.tugash);
      if (currentMinute < breakStart || currentMinute >= breakEnd) {
        return {
          holat: "darsdan_oldin",
          fan: lessons[nextIndex],
          darsRaqami: nextIndex + 1,
          boshlanish: formatClock(nextPeriod.start),
          qolganDaqiqa: minutesUntil(nextPeriod.start, date),
        };
      }
      return {
        holat: "katta_tanaffus",
        fan: lessons[nextIndex],
        darsRaqami: nextIndex + 1,
        boshlanish: formatClock(nextPeriod.start),
        tanaffusTugashi: formatClock(nextPeriod.start),
      };
    }
    return {
      holat: "darsdan_oldin",
      fan: lessons[nextIndex],
      darsRaqami: nextIndex + 1,
      boshlanish: formatClock(nextPeriod.start),
      qolganDaqiqa: minutesUntil(nextPeriod.start, date),
    };
  }

  return { holat: "darslar_tugadi" };
}

function formatCountdown(minutes: number): string {
  if (minutes < 60) return `${minutes} daqiqa`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} soat ${remainder} daqiqa` : `${hours} soat`;
}

// Jadval holatini chat, bosh sahifa va kichik pufak uchun o'zbekcha matnga aylantiradi.
export function formatBellStatusMessage(
  status: BellStatus,
  pendingHomework = 0,
  reminderLeadMinutes = 5,
  date = new Date(),
  short = false,
): string {
  switch (status.holat) {
    case "dars_davom_etmoqda":
      return short
        ? `${status.darsRaqami}-dars · ${status.fan} · ${status.qolganDaqiqa} daq.`
        : `📚 Hozir ${status.darsRaqami}-dars: ${status.fan}. Tugashiga ${status.qolganDaqiqa} daqiqa qoldi.${status.keyingiFan ? ` Keyingi dars: ${status.keyingiFan}.` : " Bugungi darslar yakunlanmoqda."}`;
    case "katta_tanaffus":
      return short
        ? `Tanaffus · ${status.fan} ${status.boshlanish}`
        : `☕ Katta tanaffus! ${status.boshlanish} da ${status.fan} boshlanadi, suv ichib ol.`;
    case "darsdan_oldin": {
      if (status.qolganDaqiqa <= reminderLeadMinutes) {
        return short
          ? `${status.fan} · ${status.qolganDaqiqa} daqiqadan keyin`
          : `⏰ ${status.qolganDaqiqa} daqiqadan keyin ${status.fan} boshlanadi, daftar va kitobingni tayyorla!`;
      }
      if (short) return `${status.darsRaqami}-dars · ${formatCountdown(status.qolganDaqiqa)} qoldi`;
      return status.darsRaqami === 1
        ? `Birinchi darsga ${formatCountdown(status.qolganDaqiqa)} qoldi.`
        : `Keyingi darsga ${formatCountdown(status.qolganDaqiqa)} qoldi. ${status.fan} ${status.boshlanish} da boshlanadi.`;
    }
    case "darslar_tugadi":
      return short
        ? `Darslar tugadi · ${pendingHomework} ta vazifa`
        : `🎉 Bugungi darslar tugadi! Uy vazifalaringni ko'rib chiqamizmi? Bajarilmagan uy vazifalari: ${pendingHomework} ta.`;
    case "dam_olish_kuni": {
      if (!status.keyingiFan || !status.keyingiSana) return short ? "Bugun dars yo'q" : "Bugun dars yo'q, yaxshilab dam ol!";
      const tomorrow = new Date(date);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const isTomorrow = localDateKey(tomorrow) === status.keyingiSana;
      const dayLabel = isTomorrow ? "Ertaga" : "Keyingi dars kuni";
      return short
        ? `Dam olish · ${status.keyingiFan}`
        : `Bugun dars yo'q, dam ol! ${dayLabel} ${status.keyingiFan} bor.`;
    }
  }
}
