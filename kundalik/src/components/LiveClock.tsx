import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { defaultLiveClockSettings, isLiveClockSettings } from "@/data/liveClock";
import { isDayOffList } from "@/data/calendar";
import { defaultPeriods, isClassPeriodList, type ClassPeriod } from "@/data/preferences";
import { subjects } from "@/data/schedule";
import { usePersistentState } from "@/hooks/usePersistentState";
import { getCurrentStatus } from "@/utils/bellTime";

const weekdayNames = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
const monthNames = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
const subjectColors: Record<string, string> = {
  violet: "#9b7cf3", blue: "#5793f5", emerald: "#42b883", cyan: "#48b9c7",
  orange: "#f29a53", amber: "#e8b84c", rose: "#e77d9d", lime: "#8bbd55",
  indigo: "#8278e8", sky: "#50a9d9", red: "#e26969", pink: "#e17eb0",
  fuchsia: "#d875cc", slate: "#8490a3", teal: "#43afa5", yellow: "#d5b544",
  purple: "#9b7cf3",
};

function twoDigits(value: number): string {
  return String(value).padStart(2, "0");
}

function formatCountdown(minutes: number): string {
  if (minutes < 60) return `${minutes} daqiqa`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} soat ${remainder} daqiqa` : `${hours} soat`;
}

function getStatusLabel(
  status: ReturnType<typeof getCurrentStatus>,
): string {
  switch (status.holat) {
    case "dars_davom_etmoqda":
      return `${status.darsRaqami}-dars · ${status.fan}`;
    case "katta_tanaffus":
      return "☕ Katta tanaffus";
    case "darsdan_oldin":
      return `Dars boshlanishiga ${formatCountdown(status.qolganDaqiqa)}`;
    case "darslar_tugadi":
      return "Darslar tugadi";
    case "dam_olish_kuni":
      return "Bugun dars yo'q";
  }
}

// Soat har soniyada faqat shu komponent ichida yangilanadi.
export function LiveClock() {
  const [now, setNow] = useState(() => new Date());
  const [clockSettings] = usePersistentState(
    "kundalik-live-clock", isLiveClockSettings, defaultLiveClockSettings,
  );
  const [periods] = usePersistentState<ClassPeriod[]>(
    "kundalik-periods", isClassPeriodList, defaultPeriods,
  );
  const [daysOff] = usePersistentState("kundalik-days-off", isDayOffList, []);

  useEffect(() => {
    const updateTime = () => setNow(new Date());
    const timer = window.setInterval(updateTime, 1000);
    document.addEventListener("visibilitychange", updateTime);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", updateTime);
    };
  }, []);

  const status = getCurrentStatus(now, periods, daysOff);
  const hour = clockSettings.format === "24h" ? now.getHours() : (now.getHours() % 12 || 12);
  const clockText = [
    twoDigits(hour),
    twoDigits(now.getMinutes()),
    ...(clockSettings.showSeconds ? [twoDigits(now.getSeconds())] : []),
  ];
  const dateLabel = `${weekdayNames[now.getDay()]}, ${now.getDate()}-${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  const activeLesson = status.holat === "dars_davom_etmoqda" ? status : null;
  const activePeriod = activeLesson
    ? periods[activeLesson.darsRaqami - 1]
    : undefined;
  const minuteOfDay = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const progress = activePeriod
    ? Math.min(1, Math.max(0, (minuteOfDay - activePeriod.start) / (activePeriod.end - activePeriod.start)))
    : 0;
  const subject = activeLesson ? subjects[activeLesson.fan] : undefined;
  const secondsUntilEnd = activePeriod ? (activePeriod.end - minuteOfDay) * 60 : Infinity;
  const urgency = secondsUntilEnd <= 60 ? "urgent" : secondsUntilEnd <= 5 * 60 ? "warning" : "";
  const ringColor = urgency === "urgent"
    ? "#ef5350"
    : urgency === "warning" ? "#f2bd4b" : subjectColors[subject?.rang ?? "violet"] ?? "#9b7cf3";

  return (
    <section className="live-clock-card" aria-label="Jonli soat">
      <div className="live-clock-heading">
        <span className="live-clock-indicator" />
        <span>HOZIRGI VAQT</span>
      </div>
      <div className="live-clock-display">
        <div className="live-clock-time" aria-label="Mahalliy vaqt">
          {clockText.map((part, index) => (
            <span className="live-clock-part" key={index}>
              {index > 0 && <span className="live-clock-colon">:</span>}
              <span>{part}</span>
            </span>
          ))}
          {clockSettings.format === "12h" && <small className="live-clock-meridiem">{now.getHours() < 12 ? "AM" : "PM"}</small>}
        </div>
        {activeLesson && activePeriod && (
          <motion.div
            key={`${activeLesson.darsRaqami}-${activeLesson.fan}`}
            className={`live-clock-ring ${urgency}`}
            style={{ color: ringColor }}
            initial={{ scale: 0.86, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25 }}
            role="progressbar"
            aria-label={`${activeLesson.darsRaqami}-darsning o'tgan vaqti`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
          >
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <circle className="live-clock-ring-track" cx="32" cy="32" r="27" />
              <circle
                className="live-clock-ring-value"
                cx="32" cy="32" r="27"
                style={{ strokeDasharray: `${2 * Math.PI * 27}`, strokeDashoffset: `${2 * Math.PI * 27 * (1 - progress)}` }}
              />
            </svg>
            <span>{Math.round(progress * 100)}%</span>
          </motion.div>
        )}
      </div>
      <p className="live-clock-date">{dateLabel}</p>
      <motion.span
        key={`${status.holat}-${status.holat === "dars_davom_etmoqda" ? status.fan : status.holat === "darsdan_oldin" ? status.fan : ""}`}
        className="live-clock-status"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {getStatusLabel(status)}
      </motion.span>
    </section>
  );
}
