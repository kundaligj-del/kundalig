import { useMemo } from "react";
import { BookOpenCheck, CalendarDays, ChartNoAxesColumnIncreasing, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { RoutePageLayout } from "@/components/RoutePageLayout";
import { defaultCalendarSettings, formatUzDate, getDateKey, isCalendarSettings, isDayOffList } from "@/data/calendar";
import { subjects, week } from "@/data/schedule";
import { usePersistentState } from "@/hooks/usePersistentState";
import { countLessonsBySubject } from "@/utils/lessonCounter";
import { getDueWeakTopics, isWeakTopicList } from "@/data/weakTopics";

// O'quv yili sanasi va kalendardagi dam olishlarni inobatga olgan statistika.
export default function StatisticsPage() {
  const [calendarSettings] = usePersistentState(
    "kundalik-calendar-settings", isCalendarSettings, defaultCalendarSettings,
  );
  const [daysOff] = usePersistentState("kundalik-days-off", isDayOffList, []);
  const [weakTopics] = usePersistentState("kundalik-weak-topics", isWeakTopicList, []);
  const today = new Date();
  const todayKey = getDateKey(today);
  const counts = useMemo(
    () => countLessonsBySubject(
      week,
      calendarSettings.schoolYearStart,
      new Date(`${todayKey}T12:00:00`),
      daysOff.map((day) => day.date),
    ),
    [calendarSettings.schoolYearStart, daysOff, todayKey],
  );
  const totalLessons = counts.reduce((sum, item) => sum + item.total, 0);
  const weekLessons = counts.reduce((sum, item) => sum + item.thisWeek, 0);
  const maximum = Math.max(...counts.map((item) => item.total), 0);
  const startDate = new Date(`${calendarSettings.schoolYearStart}T12:00:00`);
  const dueWeakTopics = getDueWeakTopics(weakTopics, todayKey);
  const dueIds = new Set(dueWeakTopics.map((item) => item.id));
  const sortedWeakTopics = [...weakTopics].sort((first, second) =>
    Number(dueIds.has(second.id)) - Number(dueIds.has(first.id))
    || second.lastErrorAt.localeCompare(first.lastErrorAt),
  );

  return (
    <RoutePageLayout
      eyebrow="BILIMLAR TAHLILI"
      title="Statistika"
      description="O'quv yili davomida har bir fandan nechta dars o'tganini kuzatib bor."
    >
      <div className="statistics-summary">
        <section className="statistics-total-card">
          <span className="statistics-summary-icon"><BookOpenCheck size={19} /></span>
          <div><span>Jami o'tilgan darslar</span><b>{totalLessons}</b><small>{formatUzDate(startDate)} dan bugungacha</small></div>
          <Sparkles className="statistics-summary-sparkle" size={24} />
        </section>
        <section className="statistics-week-card">
          <span className="statistics-summary-icon"><CalendarDays size={19} /></span>
          <div><span>Shu haftada o'tilgan</span><b>{weekLessons}</b><small>Bugungacha, dam olish kunlarisiz</small></div>
        </section>
      </div>

      <section className="statistics-panel">
        <div className="statistics-heading">
          <div><span className="statistics-heading-icon"><ChartNoAxesColumnIncreasing size={17} /></span><div><h2>Fanlar bo'yicha</h2><p>Rangli chiziq darslar sonini fanlar orasida taqqoslaydi.</p></div></div>
          <span className="statistics-subject-count">{counts.length} ta fan</span>
        </div>
        {calendarSettings.schoolYearStart > todayKey && (
          <p className="statistics-notice">O'quv yili boshlanish sanasi hali kelmagan. Sozlamalarda sanani tekshirib ko'ring.</p>
        )}
        <div className="statistics-subject-grid">
          {counts.map((item, index) => {
            const subject = subjects[item.subject];
            if (!subject) return null;
            const progress = maximum ? (item.total / maximum) * 100 : 0;
            return (
              <motion.article
                className={`statistics-subject-card subject-${subject.rang}`}
                key={item.subject}
                initial={{ opacity: 0, y: 9 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .22, delay: index * .018 }}
              >
                <div className="statistics-subject-top">
                  <span className="statistics-subject-name">{subject.nomi}</span>
                  <b>{item.total}</b>
                </div>
                <div
                  className="statistics-progress"
                  role="progressbar"
                  aria-label={`${subject.nomi} darslari`}
                  aria-valuemin={0}
                  aria-valuemax={maximum}
                  aria-valuenow={item.total}
                >
                  <span style={{ width: `${progress}%`, backgroundColor: `var(--${subject.rang}-color)` }} />
                </div>
                <div className="statistics-subject-foot">
                  <span>Jami dars</span><span>Bu hafta <b>{item.thisWeek}</b></span>
                </div>
              </motion.article>
            );
          })}
        </div>
        <p className="statistics-footnote">Hisob o'quv yili boshlanishidan bugungacha yuritiladi. Yakshanba va kalendarda dam olish deb belgilangan kunlar sanalmaydi.</p>
      </section>

      <section className="statistics-panel weak-topics-panel">
        <div className="statistics-heading">
          <div><span className="statistics-heading-icon"><Sparkles size={17} /></span><div><h2>Zaif mavzularim</h2><p>Xato qilingan test va uy vazifalari bo'yicha oraliqli takrorlash.</p></div></div>
          <span className="statistics-subject-count">{dueWeakTopics.length} ta bugun</span>
        </div>
        {sortedWeakTopics.length === 0 ? (
          <p className="weak-topics-empty">Hozircha zaif mavzu yo'q. Test yoki uy vazifasida xato bo'lsa, shu yerda ko'rinadi.</p>
        ) : (
          <div className="weak-topic-list">
            {sortedWeakTopics.map((item) => {
              const due = item.nextReviewDate !== null && item.nextReviewDate <= todayKey;
              const mastered = item.nextReviewDate === null;
              return (
                <article className="weak-topic-card" key={item.id}>
                  <div className="weak-topic-card-top">
                    <div><b>{item.subject}</b><span>{item.topic}</span></div>
                    <small className={due ? "weak-topic-due" : mastered ? "weak-topic-mastered" : ""}>
                      {due
                        ? "Bugun takrorlash"
                        : mastered
                          ? "Mustahkamlandi"
                          : item.nextReviewDate
                            ? `Keyingi: ${formatUzDate(new Date(`${item.nextReviewDate}T12:00:00`))}`
                            : ""}
                    </small>
                  </div>
                  <div className="weak-topic-progress" role="progressbar" aria-label={`${item.topic} takrorlash bosqichi`} aria-valuemin={0} aria-valuemax={3} aria-valuenow={item.reviewStep}>
                    <span style={{ width: `${item.reviewStep / 3 * 100}%` }} />
                  </div>
                  <div className="weak-topic-card-foot">
                    <span>{item.reviewStep}/3 takrorlash</span>
                    <span>{item.wrongAttempts} xato urinish</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        <p className="statistics-footnote">Xato qilgan mavzu 1 kundan keyin, muvaffaqiyatli takrordan so'ng esa 3 va 7 kundan keyin qayta ko'rinadi.</p>
      </section>
    </RoutePageLayout>
  );
}
