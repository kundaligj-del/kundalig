import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarDays, CircleAlert, CircleCheck, Plus, Trash2 } from "lucide-react";
import { RoutePageLayout } from "@/components/RoutePageLayout";
import { useHomeworkStorage } from "@/hooks/useHomeworkStorage";
import { usePersistentState } from "@/hooks/usePersistentState";
import { isDayOffList, type DayOff } from "@/data/calendar";
import {
  daysBetweenDateKeys, formatUzDate, formatUzMonth, getDateKey, getMonthGrid, getSchoolDayIndex,
} from "@/data/calendar";
import { week } from "@/data/schedule";

const weekHeaders = ["Du", "Se", "Chor", "Pay", "Ju", "Sha", "Ya"];
// Oylik taqvimda dars, vazifa muddatlari va belgilangan dam olish kunlari ko'rinadi.
export default function CalendarPage() {
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);
  const [holidayLabel, setHolidayLabel] = useState("");
  const [homework] = useHomeworkStorage();
  const [daysOff, updateDaysOff] = usePersistentState<DayOff[]>("kundalik-days-off", isDayOffList, []);

  const todayKey = getDateKey(today);
  const selectedKey = getDateKey(selectedDate);
  const offDay = daysOff.find((day) => day.date === selectedKey);
  const dayIndex = getSchoolDayIndex(selectedDate);
  const selectedLessons = dayIndex < 0 || offDay ? [] : week[dayIndex].fanlar;
  const dueHomework = homework.filter((item) => item.dueDate === selectedKey);
  const grid = useMemo(() => getMonthGrid(month), [month]);
  const monthHomework = useMemo(() => new Map(
    homework.filter((item) => item.dueDate && !item.completed)
      .map((item) => [item.dueDate as string, item]),
  ), [homework]);
  const urgentDates = useMemo(() => new Set(homework
    .filter((item) => {
      if (item.completed || !item.dueDate) return false;
      const daysLeft = daysBetweenDateKeys(todayKey, item.dueDate);
      return daysLeft <= 2;
    })
    .map((item) => item.dueDate as string)), [homework, todayKey]);

  function moveMonth(amount: number) {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  }

  function selectDate(date: Date) {
    setSelectedDate(date);
    if (date.getMonth() !== month.getMonth() || date.getFullYear() !== month.getFullYear()) {
      setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  }

  function addDayOff() {
    const label = holidayLabel.trim() || "Dam olish kuni";
    updateDaysOff((current) => [...current.filter((item) => item.date !== selectedKey), { date: selectedKey, label }]);
    setHolidayLabel("");
  }

  function removeDayOff(date: string) {
    updateDaysOff((current) => current.filter((item) => item.date !== date));
  }

  return (
    <RoutePageLayout
      eyebrow="OYLIK REJA"
      title="Kalendar"
      description="Kun tanla: darslaring, shu kunga topshiriladigan vazifalar va dam olish belgilari shu yerda ko'rinadi."
    >
      <div className="calendar-layout">
        <section className="calendar-card">
          <div className="calendar-month-bar">
            <button type="button" className="calendar-arrow" onClick={() => moveMonth(-1)} aria-label="Oldingi oy">
              <ArrowLeft size={17} />
            </button>
            <h2>{formatUzMonth(month)}</h2>
            <button type="button" className="calendar-arrow" onClick={() => moveMonth(1)} aria-label="Keyingi oy">
              <ArrowRight size={17} />
            </button>
          </div>
          <div className="calendar-grid calendar-weekdays" aria-hidden="true">
            {weekHeaders.map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="calendar-grid">
            <AnimatePresence mode="wait">
              <motion.div
                className="calendar-days"
                key={`${month.getFullYear()}-${month.getMonth()}`}
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.16 }}
              >
                {grid.map((date) => {
                  const key = getDateKey(date);
                  const isToday = key === todayKey;
                  const isSelected = key === selectedKey;
                  const hasHomework = monthHomework.has(key);
                  const isUrgent = urgentDates.has(key);
                  const isDayOff = daysOff.some((item) => item.date === key);
                  return (
                    <button
                      key={key}
                      type="button"
                      className={[
                        "calendar-day",
                        date.getMonth() === month.getMonth() ? "" : "calendar-day-muted",
                        isToday ? "calendar-day-today" : "",
                        isSelected ? "calendar-day-selected" : "",
                        isDayOff ? "calendar-day-off" : "",
                      ].filter(Boolean).join(" ")}
                      onClick={() => selectDate(date)}
                      aria-label={`${formatUzDate(date)}${isDayOff ? ", dam olish kuni" : ""}${hasHomework ? ", uy vazifasi bor" : ""}`}
                      aria-pressed={isSelected}
                    >
                      <span>{date.getDate()}</span>
                      <i className={`calendar-dot ${hasHomework ? "calendar-dot-homework" : ""}`} />
                      {isUrgent && <i className="calendar-dot calendar-dot-urgent" />}
                      {isDayOff && <i className="calendar-dot calendar-dot-holiday" />}
                    </button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="calendar-legend">
            <span><i className="calendar-dot calendar-dot-homework" /> Vazifa bor</span>
            <span><i className="calendar-dot calendar-dot-urgent" /> Muddati yaqin</span>
            <span><i className="calendar-dot calendar-dot-holiday" /> Dam olish</span>
          </div>
        </section>

        <aside className="calendar-detail-card">
          <div className="calendar-detail-heading">
            <span className="calendar-detail-icon"><CalendarDays size={18} /></span>
            <div><span className="eyebrow muted-eyebrow">TANLANGAN KUN</span><h2>{formatUzDate(selectedDate, { weekday: "long" })}</h2></div>
          </div>
          {offDay ? (
            <div className="calendar-dayoff-notice"><span>🌿</span><div><b>{offDay.label}</b><small>Bu kunda darslar hisoblanmaydi.</small></div></div>
          ) : dayIndex < 0 ? (
            <div className="calendar-dayoff-notice"><span>☀️</span><div><b>Yakshanba</b><small>Bugun dars rejalashtirilmagan.</small></div></div>
          ) : (
            <section className="calendar-detail-section">
              <h3>Dars jadvali <span>{selectedLessons.length} ta</span></h3>
              <ol className="calendar-lesson-list">
                {selectedLessons.map((lesson, index) => (
                  <li key={`${lesson}-${index}`}><span>{index + 1}</span>{lesson}</li>
                ))}
              </ol>
            </section>
          )}

          <section className="calendar-detail-section calendar-homework-section">
            <h3>Uy vazifalari <span>{dueHomework.length} ta</span></h3>
            {dueHomework.length ? (
              <ul className="calendar-homework-list">
                {dueHomework.map((item) => (
                  <li key={item.id} className={item.completed ? "calendar-homework-done" : ""}>
                    {item.completed ? <CircleCheck size={15} /> : <CircleAlert size={15} />}
                    <div><b>{item.subject}</b><span>{item.title}</span></div>
                  </li>
                ))}
              </ul>
            ) : <p className="calendar-empty-note">Bu kun uchun muddati belgilangan vazifa yo'q.</p>}
          </section>

          <section className="calendar-dayoff-control">
            {offDay ? (
              <button type="button" className="calendar-remove-off" onClick={() => removeDayOff(selectedKey)}>
                <Trash2 size={15} /> Dam olish belgisini olib tashlash
              </button>
            ) : (
              <>
                <label htmlFor="dayoff-label">Dam olish yoki bayram nomi</label>
                <div className="calendar-dayoff-input">
                  <input
                    id="dayoff-label"
                    value={holidayLabel}
                    maxLength={50}
                    onChange={(event) => setHolidayLabel(event.target.value)}
                    placeholder="Masalan: Mustaqillik kuni"
                  />
                  <button type="button" onClick={addDayOff} aria-label="Dam olish kuni sifatida belgilash"><Plus size={17} /></button>
                </div>
                <small>Belgilangan kunda darslar sanog'i hisoblanmaydi.</small>
              </>
            )}
          </section>
        </aside>
      </div>
      <div className="calendar-upcoming">
        <h2>Dam olish kunlari</h2>
        {daysOff.length ? (
          <div className="calendar-off-list">
            {[...daysOff].sort((a, b) => a.date.localeCompare(b.date)).map((item) => (
              <div key={item.date}><span>🌿</span><b>{item.label}</b><time>{formatUzDate(new Date(`${item.date}T00:00:00`))}</time>
                <button type="button" onClick={() => removeDayOff(item.date)} aria-label={`${item.label} belgisini o'chirish`}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        ) : <p>Hozircha dam olish kuni belgilanmagan. Kalendar ichidan kun tanlab qo'shishingiz mumkin.</p>}
      </div>
    </RoutePageLayout>
  );
}
