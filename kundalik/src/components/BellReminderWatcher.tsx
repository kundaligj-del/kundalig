import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BellRing, X } from "lucide-react";
import { getDateKey, isDayOffList, type DayOff } from "@/data/calendar";
import { defaultBellReminderSettings, isBellReminderSettings } from "@/data/bellReminders";
import { defaultPeriods, getSystemColorTheme, isClassPeriodList, isColorTheme, type ClassPeriod } from "@/data/preferences";
import { getCurrentStatus } from "@/utils/bellTime";
import { usePersistentState } from "@/hooks/usePersistentState";

type ReminderNotice = { id: string; text: string } | null;

function isString(value: unknown): value is string {
  return typeof value === "string";
}

// Ilova ochiq turganda dars boshlanishini tekshiradi va takroriy eslatmani to'xtatadi.
export function BellReminderWatcher() {
  const [periods] = usePersistentState<ClassPeriod[]>("kundalik-periods", isClassPeriodList, defaultPeriods);
  const [daysOff] = usePersistentState<DayOff[]>("kundalik-days-off", isDayOffList, []);
  const [settings] = usePersistentState("kundalik-bell-reminders", isBellReminderSettings, defaultBellReminderSettings);
  const [theme] = usePersistentState<"light" | "dark">("kundalik-theme", isColorTheme, getSystemColorTheme());
  const [lastReminderKey, updateLastReminderKey] = usePersistentState(
    "kundalik-bell-last-reminder", isString, "",
  );
  const [notice, setNotice] = useState<ReminderNotice>(null);
  const lastReminderRef = useRef(lastReminderKey);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    lastReminderRef.current = lastReminderKey;
  }, [lastReminderKey]);

  useEffect(() => {
    function checkBellTime() {
      const now = new Date();
      if (!settings.enabled) {
        setNotice(null);
        return;
      }

      const status = getCurrentStatus(now, periods, daysOff);
      let nextClass: { fan: string; darsRaqami: number; boshlanish: string } | null = null;
      if (status.holat === "darsdan_oldin" || status.holat === "katta_tanaffus") {
        nextClass = {
          fan: status.fan,
          darsRaqami: status.darsRaqami,
          boshlanish: status.boshlanish,
        };
      }
      if (!nextClass) return;

      const [hour, minute] = nextClass.boshlanish.split(":").map(Number);
      const startsAt = hour * 60 + minute;
      const currentTime = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
      const remainingMinutes = Math.ceil(startsAt - currentTime);
      if (remainingMinutes < 0 || remainingMinutes > settings.leadMinutes) return;

      const id = `${getDateKey(now)}-${nextClass.darsRaqami}`;
      if (lastReminderRef.current === id) return;
      lastReminderRef.current = id;
      updateLastReminderKey(() => id);

      const text = `⏰ ${remainingMinutes} daqiqadan keyin ${nextClass.fan} boshlanadi, daftar va kitobingni tayyorla!`;
      setNotice({ id, text });
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setNotice(null), 60_000);

      if (settings.browserNotifications && "Notification" in window && Notification.permission === "granted") {
        try {
          new Notification("Mitticha eslatadi", { body: text, tag: id });
        } catch {
          setNotice({ id, text });
        }
      }
    }

    checkBellTime();
    const interval = window.setInterval(checkBellTime, 30_000);
    return () => window.clearInterval(interval);
  }, [daysOff, periods, settings, updateLastReminderKey]);

  useEffect(() => () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
  }, []);

  return (
    <AnimatePresence>
      {notice && (
        <motion.aside
          key={notice.id}
          className="bell-reminder-toast"
          data-theme={theme}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 12, scale: .96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: .97 }}
          transition={{ duration: .2 }}
        >
          <BellRing size={17} />
          <span>{notice.text}</span>
          <button type="button" aria-label="Eslatmani yopish" onClick={() => setNotice(null)}><X size={15} /></button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
