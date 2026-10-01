import { useEffect, useState, type FormEvent } from "react";
import { Bell, BellRing, CalendarDays, Check, Clock3, Sparkles, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { RoutePageLayout } from "@/components/RoutePageLayout";
import { defaultCalendarSettings, formatUzDate, isCalendarSettings, isDayOffList, type DayOff } from "@/data/calendar";
import { ScheduleSettingsDialog } from "@/components/ScheduleSettingsDialog";
import { defaultBellReminderSettings, isBellReminderSettings } from "@/data/bellReminders";
import { defaultLiveClockSettings, isLiveClockSettings } from "@/data/liveClock";
import { defaultPeriods, isClassPeriodList, type ClassPeriod } from "@/data/preferences";
import { usePersistentState } from "@/hooks/usePersistentState";
import { topics } from "@/data/topics";
import { defaultMittichaSettings, isMittichaSettings, type MittichaSettings } from "@/data/mittichaSettings";
import { defaultAutoHomeworkSettings, isAutoHomeworkSettings } from "@/data/autoHomework";
import { subjects } from "@/data/schedule";

type UnknownMessage = { text: string; time: string };
function isUnknownMessages(value: unknown): value is UnknownMessage[] {
  return Array.isArray(value) && value.every((item) => typeof item === "object" && item !== null
    && "text" in item && typeof item.text === "string" && "time" in item && typeof item.time === "string");
}

// O'quv yili boshlanish sanasi darslar statistikasining boshlang'ich nuqtasidir.
export default function SettingsPage() {
  const [settings, updateSettings] = usePersistentState(
    "kundalik-calendar-settings", isCalendarSettings, defaultCalendarSettings,
  );
  const [daysOff, updateDaysOff] = usePersistentState<DayOff[]>("kundalik-days-off", isDayOffList, []);
  const [schoolYearStart, setSchoolYearStart] = useState(settings.schoolYearStart);
  const [saved, setSaved] = useState(false);
  const [mittichaSettings, updateMittichaSettings] = usePersistentState(
    "kundalik-mitticha-settings", isMittichaSettings, defaultMittichaSettings,
  );
  const [periods, updatePeriods] = usePersistentState<ClassPeriod[]>(
    "kundalik-periods", isClassPeriodList, defaultPeriods,
  );
  const [bellReminders, updateBellReminders] = usePersistentState(
    "kundalik-bell-reminders", isBellReminderSettings, defaultBellReminderSettings,
  );
  const [liveClock, updateLiveClock] = usePersistentState(
    "kundalik-live-clock", isLiveClockSettings, defaultLiveClockSettings,
  );
  const [autoHomework, updateAutoHomework] = usePersistentState(
    "kundalik-auto-homework-settings", isAutoHomeworkSettings, defaultAutoHomeworkSettings,
  );
  const [showScheduleSettings, setShowScheduleSettings] = useState(false);
  const [bellReminderMessage, setBellReminderMessage] = useState("");
  const [autoHomeworkMessage, setAutoHomeworkMessage] = useState("");
  const [dataMessage, setDataMessage] = useState("");
  const [unknownMessages] = usePersistentState<UnknownMessage[]>(
    "kundalik-unknown-messages", isUnknownMessages, [],
  );

  useEffect(() => {
    const onStatus = (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail;
      if (typeof detail === "string") setAutoHomeworkMessage(detail);
    };
    window.addEventListener("kundalik:auto-homework-status", onStatus);
    return () => window.removeEventListener("kundalik:auto-homework-status", onStatus);
  }, []);

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateSettings(() => ({ schoolYearStart }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  function removeDayOff(date: string) {
    updateDaysOff((current) => current.filter((item) => item.date !== date));
  }

  function saveMittichaSetting(update: (current: MittichaSettings) => MittichaSettings) {
    updateMittichaSettings(update);
    setDataMessage("Mitticha sozlamalari saqlandi.");
  }

  async function toggleBrowserNotifications(enabled: boolean) {
    if (!enabled) {
      updateBellReminders((current) => ({ ...current, browserNotifications: false }));
      setBellReminderMessage("Brauzer bildirishnomalari o'chirildi; sayt ichidagi eslatmalar sozlamaga muvofiq ishlaydi.");
      return;
    }
    if (!("Notification" in window)) {
      setBellReminderMessage("Bu brauzer bildirishnomalarni qo'llamaydi. Sayt ichidagi eslatmalar ishlayveradi.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        updateBellReminders((current) => ({ ...current, browserNotifications: true }));
        setBellReminderMessage("Brauzer bildirishnomalariga ruxsat berildi.");
        return;
      }
      updateBellReminders((current) => ({ ...current, browserNotifications: false }));
      setBellReminderMessage("Ruxsat berilmadi. Xavotir olma, eslatmalar faqat sayt ichida ko'rinadi.");
    } catch {
      updateBellReminders((current) => ({ ...current, browserNotifications: false }));
      setBellReminderMessage("Brauzer ruxsatini olib bo'lmadi. Sayt ichidagi eslatmalar ishlayveradi.");
    }
  }

  async function toggleAutoHomeworkNotifications(enabled: boolean) {
    if (!enabled) {
      updateAutoHomework((current) => ({ ...current, browserNotifications: false }));
      setAutoHomeworkMessage("Avtomatik vazifalar uchun brauzer bildirishnomasi o'chirildi.");
      return;
    }
    if (!("Notification" in window)) {
      setAutoHomeworkMessage("Brauzer bildirishnomalarni qo'llamaydi; sayt ichidagi xabar ishlaydi.");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        updateAutoHomework((current) => ({ ...current, browserNotifications: true }));
        setAutoHomeworkMessage("Avtomatik vazifa bildirishnomasi yoqildi.");
      } else {
        updateAutoHomework((current) => ({ ...current, browserNotifications: false }));
        setAutoHomeworkMessage("Ruxsat berilmadi. Mitticha saytdagi gap pufagida xabar beradi.");
      }
    } catch {
      updateAutoHomework((current) => ({ ...current, browserNotifications: false }));
      setAutoHomeworkMessage("Brauzer ruxsatini olib bo'lmadi. Sayt ichidagi xabar qoladi.");
    }
  }

  function updateAutoSetting(change: Parameters<typeof updateAutoHomework>[0]) {
    updateAutoHomework(change);
    setAutoHomeworkMessage("Avtomatik vazifa sozlamalari saqlandi.");
  }

  function toggleAutoSubject(subject: string, enabled: boolean) {
    updateAutoSetting((current) => ({
      ...current,
      excludedSubjects: enabled
        ? current.excludedSubjects.filter((item) => item !== subject)
        : [...new Set([...current.excludedSubjects, subject])],
    }));
  }

  function requestHomeworkNow() {
    window.dispatchEvent(new Event("kundalik:auto-homework-now"));
    setAutoHomeworkMessage("Mittichaga hozir vazifa tuzishni so'radim. Tayyor bo'lsa shu yerda xabar chiqadi.");
  }

  function clearData(label: string, keys: string[]) {
    if (!window.confirm(`${label} ma'lumotlari o'chadi. Davom etamizmi?`)) return;
    try {
      keys.forEach((key) => localStorage.removeItem(key));
      setDataMessage(`${label} tozalandi.`);
      window.setTimeout(() => window.location.reload(), 400);
    } catch {
      setDataMessage("Brauzer xotirasini tozalab bo'lmadi. Brauzer ruxsatlarini tekshiring.");
    }
  }

  function clearEverything() {
    if (!window.confirm("Kundalikdagi barcha saqlangan ma'lumotlar o'chadi. Davom etamizmi?")) return;
    try {
      Object.keys(localStorage).filter((key) => key.startsWith("kundalik-")).forEach((key) => localStorage.removeItem(key));
      window.location.reload();
    } catch {
      setDataMessage("Brauzer xotirasini tozalab bo'lmadi. Brauzer ruxsatlarini tekshiring.");
    }
  }

  return (
    <RoutePageLayout
      eyebrow="SHAXSIY SOZLAMALAR"
      title="Sozlamalar"
      description="O'quv yili boshlanish sanasini kiriting va kalendarda belgilangan dars bo'lmaydigan kunlarni boshqaring."
    >
      <section className="settings-panel">
        <div className="settings-panel-heading">
          <span className="calendar-detail-icon"><CalendarDays size={18} /></span>
          <div><h2>O'quv yili</h2><p>Bu sana fanlar bo'yicha darslar sanog'ini hisoblash uchun ishlatiladi.</p></div>
        </div>
        <form className="school-year-form" onSubmit={saveSettings}>
          <label htmlFor="school-year-start">O'quv yilining boshlanish sanasi</label>
          <div className="school-year-field">
            <input
              id="school-year-start"
              type="date"
              required
              value={schoolYearStart}
              onChange={(event) => setSchoolYearStart(event.target.value)}
            />
            <button type="submit"><Check size={16} /> Saqlash</button>
          </div>
          {saved && <span className="settings-saved"><Check size={14} /> Sana saqlandi</span>}
        </form>
        <div className="settings-hint">
          <span>💡</span>
          <p>Dam olish va bayram kunlarini <Link to="/calendar">Kalendarda</Link> kerakli sanani tanlab belgilang. Belgilangan sanada darslar sanog'iga dars qo'shilmaydi.</p>
        </div>
      </section>

      <section className="settings-panel settings-days-off-panel">
        <div className="settings-panel-heading">
          <span className="calendar-detail-icon settings-leaf">🌿</span>
          <div><h2>Dars bo'lmaydigan kunlar</h2><p>Dam olish va bayram kunlarini shu ro'yxatdan ham boshqarishingiz mumkin.</p></div>
        </div>
        {daysOff.length ? (
          <div className="settings-days-off-list">
            {[...daysOff].sort((a, b) => a.date.localeCompare(b.date)).map((item) => (
              <div key={item.date}>
                <span className="settings-dayoff-date">{formatUzDate(new Date(`${item.date}T00:00:00`))}</span>
                <b>{item.label}</b>
                <button type="button" onClick={() => removeDayOff(item.date)} aria-label={`${item.label} kunini o'chirish`}><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        ) : (
          <p className="settings-empty">Dam olish kunlari hali qo'shilmagan. <Link to="/calendar">Kalendarni oching</Link> va kun tanlang.</p>
        )}
      </section>

      <section className="settings-panel bell-settings-panel">
        <div className="settings-panel-heading">
          <span className="calendar-detail-icon"><BellRing size={18} /></span>
          <div><h2>Dars vaqtlari va Mitticha eslatmalari</h2><p>Qo'ng'iroq jadvalini o'zgartiring va dars oldi eslatmalarini boshqaring.</p></div>
        </div>
        <button className="bell-edit-schedule" type="button" onClick={() => setShowScheduleSettings(true)}>
          <Clock3 size={15} /> Dars vaqtlarini tahrirlash
        </button>
        <label className="bell-reminder-setting">
          <span><b>Mitticha eslatmalari</b><small>Dars yaqinlashganda sayt ichida eslatadi.</small></span>
          <input
            type="checkbox"
            checked={bellReminders.enabled}
            onChange={(event) => updateBellReminders((current) => ({ ...current, enabled: event.target.checked }))}
          />
        </label>
        <label className="mitticha-setting-field bell-lead-setting">
          <span>Darsdan necha daqiqa oldin eslatsin?</span>
          <select
            value={bellReminders.leadMinutes}
            disabled={!bellReminders.enabled}
            onChange={(event) => updateBellReminders((current) => ({ ...current, leadMinutes: Number(event.target.value) }))}
          >
            {[1, 3, 5, 10, 15].map((minutes) => <option key={minutes} value={minutes}>{minutes} daqiqa</option>)}
          </select>
        </label>
        <label className="bell-reminder-setting">
          <span><b><Bell size={13} /> Brauzer bildirishnomalari</b><small>Faqat Kundalik ochiq turganida eslatma yuboradi.</small></span>
          <input
            type="checkbox"
            checked={bellReminders.browserNotifications}
            disabled={!bellReminders.enabled || !("Notification" in window)}
            onChange={(event) => void toggleBrowserNotifications(event.target.checked)}
          />
        </label>
        {!("Notification" in window) && <p className="bell-reminder-note">Bu brauzer Notification API ni qo'llamaydi. Sayt ichidagi eslatmalar baribir ishlaydi.</p>}
        {bellReminderMessage && <p className="settings-saved" role="status">{bellReminderMessage}</p>}
        <div className="live-clock-settings">
          <label className="mitticha-setting-field">
            <span>Soat formati</span>
            <select
              value={liveClock.format}
              onChange={(event) => updateLiveClock((current) => ({
                ...current, format: event.target.value === "12h" ? "12h" : "24h",
              }))}
            >
              <option value="24h">24 soatlik</option>
              <option value="12h">12 soatlik (AM/PM)</option>
            </select>
          </label>
          <label className="bell-reminder-setting">
            <span><b>Soniyalarni ko'rsatish</b><small>Jonli soatda soniyalarni yoqing yoki yashiring.</small></span>
            <input
              type="checkbox"
              checked={liveClock.showSeconds}
              onChange={(event) => updateLiveClock((current) => ({ ...current, showSeconds: event.target.checked }))}
            />
          </label>
        </div>
      </section>

      <section className="settings-panel auto-homework-settings-panel">
        <div className="settings-panel-heading">
          <span className="calendar-detail-icon"><Sparkles size={18} /></span>
          <div>
            <h2>Har kuni avtomatik uy vazifasi</h2>
            <p>Mitticha ertangi o'quv kunidagi barcha tanlangan fanlarga bitta so'rovda vazifa tuzadi. Sayt ochiq turganda vaqtni tekshiradi.</p>
          </div>
        </div>
        <label className="bell-reminder-setting">
          <span><b>Avtomatik vazifani yoqish</b><small>Belgilangan vaqtda keyingi o'quv kuni uchun tayyorlaydi.</small></span>
          <input
            type="checkbox"
            checked={autoHomework.enabled}
            onChange={(event) => updateAutoSetting((current) => ({ ...current, enabled: event.target.checked }))}
          />
        </label>
        <div className="auto-homework-fields">
          <label className="mitticha-setting-field">
            <span>Vazifa tuzish vaqti</span>
            <input
              type="time"
              value={autoHomework.time}
              disabled={!autoHomework.enabled}
              onChange={(event) => updateAutoSetting((current) => ({ ...current, time: event.target.value }))}
            />
          </label>
          <label className="mitticha-setting-field">
            <span>Har fan uchun topshiriq</span>
            <select
              value={autoHomework.tasksPerSubject}
              disabled={!autoHomework.enabled}
              onChange={(event) => updateAutoSetting((current) => ({
                ...current, tasksPerSubject: Number(event.target.value) === 2 ? 2 : 1,
              }))}
            >
              <option value={1}>1 ta</option>
              <option value={2}>2 ta</option>
            </select>
          </label>
          <label className="mitticha-setting-field">
            <span>Qiyinlik</span>
            <select
              value={autoHomework.difficulty}
              disabled={!autoHomework.enabled}
              onChange={(event) => updateAutoSetting((current) => ({
                ...current,
                difficulty: event.target.value === "oson" || event.target.value === "qiyin" ? event.target.value : "aralash",
              }))}
            >
              <option value="oson">Oson</option>
              <option value="aralash">Aralash</option>
              <option value="qiyin">Qiyin</option>
            </select>
          </label>
          <label className="mitticha-setting-field">
            <span>Jami vaqt chegarasi (daq.)</span>
            <input
              type="number"
              min={60}
              max={180}
              step={5}
              value={autoHomework.maxMinutes}
              disabled={!autoHomework.enabled}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (Number.isInteger(value) && value >= 60 && value <= 180) {
                  updateAutoSetting((current) => ({ ...current, maxMinutes: value }));
                }
              }}
            />
          </label>
        </div>
        <div className="auto-homework-subjects">
          <b>Qaysi fanlardan vazifa berilsin?</b>
          <small>Standartda hamma fan yoqilgan; hech bir jadval fani o'z-o'zidan tashlab ketilmaydi.</small>
          <div>
            {Object.keys(subjects).map((subject) => (
              <label key={subject}>
                <input
                  type="checkbox"
                  checked={!autoHomework.excludedSubjects.includes(subject)}
                  disabled={!autoHomework.enabled}
                  onChange={(event) => toggleAutoSubject(subject, event.target.checked)}
                />
                <span>{subject}</span>
              </label>
            ))}
          </div>
        </div>
        <label className="bell-reminder-setting auto-homework-notification">
          <span><b><Bell size={13} /> Brauzer bildirishnomasi</b><small>Bildirishnoma faqat sayt ochiq turganda ishlaydi. Sayt ichidagi xabar baribir ko'rinadi.</small></span>
          <input
            type="checkbox"
            checked={autoHomework.browserNotifications}
            disabled={!autoHomework.enabled || !("Notification" in window)}
            onChange={(event) => void toggleAutoHomeworkNotifications(event.target.checked)}
          />
        </label>
        <button className="bell-edit-schedule auto-homework-run" type="button" onClick={requestHomeworkNow}>
          <Sparkles size={15} /> Hozir vazifa ber
        </button>
        {autoHomeworkMessage && <p className="auto-homework-feedback" role="status">{autoHomeworkMessage}</p>}
      </section>

      <section className="settings-panel mitticha-settings-panel">
        <div className="settings-panel-heading">
          <span className="calendar-detail-icon">🐣</span>
          <div><h2>Mitticha mavzu sozlamalari</h2><p>Darslar soni bo'yicha mavzu tavsiyasini sozlang yoki o'zingiz hozirgi mavzuni tanlang.</p></div>
        </div>
        <label className="mitticha-setting-field">
          <span>Bir mavzu necha dars davom etadi?</span>
          <input type="number" min={1} max={30} value={mittichaSettings.lessonsPerTopic} onChange={(event) => {
            const value = Number(event.target.value);
            if (Number.isInteger(value) && value >= 1 && value <= 30) {
              saveMittichaSetting((current) => ({ ...current, lessonsPerTopic: value }));
            }
          }} />
        </label>
        <p className="mitticha-setting-note">Bu sozlama avtomatik tavsiyaga ishlaydi. Aniq mavzuni qo'lda tanlasangiz, o'sha tanlov ustun bo'ladi.</p>
        <div className="mitticha-topic-settings">
          {topics.map((entry) => (
            <label key={entry.fan} className="mitticha-setting-field">
              <span>{entry.fan} · hozirgi mavzu</span>
              <select value={mittichaSettings.manualTopics[entry.fan] ?? ""} onChange={(event) =>
                saveMittichaSetting((current) => {
                  const manualTopics = { ...current.manualTopics };
                  if (event.target.value) manualTopics[entry.fan] = event.target.value;
                  else delete manualTopics[entry.fan];
                  return { ...current, manualTopics };
                })
              }>
                <option value="">Darslar soniga qarab aniqlash</option>
                {entry.mavzular.map((topic) => <option value={topic} key={topic}>{topic}</option>)}
              </select>
            </label>
          ))}
        </div>
      </section>
      {showScheduleSettings && (
        <ScheduleSettingsDialog
          periods={periods}
          onClose={() => setShowScheduleSettings(false)}
          onSave={(nextPeriods) => {
            updatePeriods(() => nextPeriods);
            setShowScheduleSettings(false);
          }}
        />
      )}

      <section className="settings-panel clear-data-panel">
        <div className="settings-panel-heading">
          <span className="calendar-detail-icon">🧹</span>
          <div><h2>Saqlangan ma'lumotlarni tozalash</h2><p>Har bir tozalashdan oldin tasdiqlash so'raladi. Test natijalari va zaif mavzular alohida saqlanadi.</p></div>
        </div>
        <div className="clear-data-actions">
          <button type="button" onClick={() => clearData("Suhbat tarixi", ["kundalik-mitticha-chat"])}>Chat tarixini tozalash</button>
          <button type="button" onClick={() => clearData("Uy vazifalari", ["kundalik-homework"])}>Uy vazifalarini tozalash</button>
          <button type="button" onClick={() => clearData("Test natijalari", ["kundalik-test-results"])}>Test natijalarini tozalash</button>
          <button type="button" onClick={() => clearData("Zaif mavzular", ["kundalik-weak-topics"])}>Zaif mavzularni tozalash</button>
          <button type="button" onClick={() => clearData("Tushunilmagan iboralar tarixi", ["kundalik-unknown-messages"])}>Tushunilmagan iboralarni tozalash</button>
          <button type="button" onClick={() => clearData("Tarjimon tarixini va saqlangan so'zlarni", ["kundalik-translator-history", "kundalik-translator-favorites", "kundalik-translator-known-cards"])}>Tarjimon ma'lumotlarini tozalash</button>
          <button className="clear-all-data" type="button" onClick={clearEverything}>Hamma Kundalik ma'lumotlarini o'chirish</button>
        </div>
        {dataMessage && <p role="status" className="settings-saved">{dataMessage}</p>}
      </section>
      <section className="settings-panel unknown-phrases-panel">
        <div className="settings-panel-heading">
          <span className="calendar-detail-icon">💬</span>
          <div><h2>Mitticha tushunmagan iboralar</h2><p>Bu ro'yxat iboralar bankini keyin to'ldirish uchun faqat shu qurilmada saqlanadi.</p></div>
        </div>
        {unknownMessages.length ? (
          <ul>{unknownMessages.slice(-20).reverse().map((item, index) => (
            <li key={`${item.time}-${index}`}><q>{item.text}</q><time>{new Intl.DateTimeFormat("uz-UZ", { dateStyle: "short", timeStyle: "short" }).format(new Date(item.time))}</time></li>
          ))}</ul>
        ) : <p className="settings-empty">Hozircha tushunilmagan ibora yo'q.</p>}
      </section>
    </RoutePageLayout>
  );
}
