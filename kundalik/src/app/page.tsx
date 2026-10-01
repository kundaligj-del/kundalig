"use client";

import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowUpRight, BookOpen, CalendarDays, Clock3, Coffee, Flame,
  Moon, Search, Settings2, Sparkles, Sun,
} from "lucide-react";
import { BooksGrid } from "@/components/BooksGrid";
import { DayTabs } from "@/components/DayTabs";
import { HomeworkDialog } from "@/components/HomeworkDialog";
import { HomeworkList } from "@/components/HomeworkList";
import { LessonCard } from "@/components/LessonCard";
import { LiveClock } from "@/components/LiveClock";
import { ProfileDialog } from "@/components/ProfileDialog";
import { ScheduleSettingsDialog } from "@/components/ScheduleSettingsDialog";
import { Sidebar } from "@/components/Sidebar";
import { WeekSchedule } from "@/components/WeekSchedule";
import { getSchoolDayIndex, isDayOffList } from "@/data/calendar";
import { defaultBellReminderSettings, isBellReminderSettings } from "@/data/bellReminders";
import type { HomeworkItem } from "@/data/homework";
import { packsForSubject } from "@/data/packs";
import {
  defaultPeriods, defaultProfile, defaultProgress, getSystemColorTheme, isClassPeriodList, isLegacyDefaultPeriods,
  isColorTheme, isStudentProfile, isStudyProgress, localDateKey, type ClassPeriod,
} from "@/data/preferences";
import { subjects, week } from "@/data/schedule";
import { isTestResults } from "@/data/testResults";
import { useHomeworkStorage } from "@/hooks/useHomeworkStorage";
import { usePersistentState } from "@/hooks/usePersistentState";
import { formatBellStatusMessage, getCurrentStatus } from "@/utils/bellTime";

type MainView = "schedule" | "homework" | "books";
type ScheduleFilter = "today" | "tomorrow" | "week" | "day";

const MittichaChat = lazy(() => import("@/components/MittichaChat").then((module) => ({ default: module.MittichaChat })));
const weekdayNames = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
const monthNames = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];

function formatRemaining(minutes: number): string {
  if (minutes < 60) return `${minutes} daqiqa`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} soat ${remainder} daqiqa` : `${hours} soat`;
}

// Bosh sahifa jadval, topshiriq va saqlanadigan o'quvchi sozlamalarini birlashtiradi.
export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const now = new Date();
  const todayIndex = getSchoolDayIndex(now);
  const dateLabel = `${weekdayNames[now.getDay()]}, ${now.getDate()}-${monthNames[now.getMonth()]}`;
  const todayKey = localDateKey(now);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = localDateKey(yesterday);

  const [selectedDay, setSelectedDay] = useState(todayIndex >= 0 ? todayIndex : 0);
  const [search, setSearch] = useState("");
  const activeView: MainView = location.pathname === "/homework"
    ? "homework"
    : location.pathname === "/books" ? "books" : "schedule";
  const [scheduleFilter, setScheduleFilter] = useState<ScheduleFilter>("today");
  const [dialogSubject, setDialogSubject] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [tutorPrompt, setTutorPrompt] = useState<string | null>(null);
  const [currentMinute, setCurrentMinute] = useState(now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60);

  const [homework, updateHomework] = useHomeworkStorage();
  const [profile, updateProfile, profileLoaded] = usePersistentState("kundalik-profile", isStudentProfile, defaultProfile);
  const [periods, updatePeriods] = usePersistentState<ClassPeriod[]>("kundalik-periods", isClassPeriodList, defaultPeriods);
  const [daysOff] = usePersistentState("kundalik-days-off", isDayOffList, []);
  const [bellReminders] = usePersistentState("kundalik-bell-reminders", isBellReminderSettings, defaultBellReminderSettings);
  const [progress, updateProgress] = usePersistentState("kundalik-progress", isStudyProgress, defaultProgress);
  const [testResults, updateTestResults] = usePersistentState("kundalik-test-results", isTestResults, []);
  const [theme, updateTheme] = usePersistentState<"light" | "dark">(
    "kundalik-theme", isColorTheme, getSystemColorTheme(),
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      const current = new Date();
      setCurrentMinute(current.getHours() * 60 + current.getMinutes() + current.getSeconds() / 60);
    }, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isLegacyDefaultPeriods(periods)) updatePeriods(() => defaultPeriods);
  }, [periods, updatePeriods]);

  const currentDay = week[selectedDay];
  const visibleLessons = useMemo(
    () => currentDay.fanlar
      .map((name, index) => ({ name, index }))
      .filter(({ name }) => name.toLocaleLowerCase("uz").includes(search.toLocaleLowerCase("uz"))),
    [currentDay, search],
  );
  const todayLessons = homework.filter((item) => !item.completed).length;
  const currentBellStatus = getCurrentStatus(now, periods, daysOff);
  const bellStatusMessage = formatBellStatusMessage(currentBellStatus, todayLessons, bellReminders.leadMinutes, now);
  const bellStatusKey = JSON.stringify(currentBellStatus);
  const allHomeworkDone = homework.length > 0 && homework.every((item) => item.completed);
  const doneToday = progress.lastCompletedDate === todayKey && allHomeworkDone;
  const yesterdayDone = progress.lastCompletedDate === yesterdayKey;
  const visibleStreak = doneToday || yesterdayDone ? progress.streak : 0;
  const relevantPeriods = periods.slice(0, currentDay.fanlar.length);
  const currentLessonIndex = relevantPeriods.findIndex((period) => currentMinute >= period.start && currentMinute < period.end);
  const nextLessonIndex = relevantPeriods.findIndex((period) => period.start > currentMinute);
  const todayIsSchoolDay = todayIndex >= 0 && !daysOff.some((day) => day.date === todayKey);
  const upcomingLessonIndex = currentLessonIndex >= 0 ? currentLessonIndex + 1 : nextLessonIndex;
  const tomorrowIndex = todayIndex === week.length - 1 ? 0 : todayIndex + 1;

  function selectFilter(filter: Exclude<ScheduleFilter, "day">) {
    setScheduleFilter(filter);
    if (filter === "today") setSelectedDay(todayIndex >= 0 ? todayIndex : 0);
    if (filter === "tomorrow") setSelectedDay(tomorrowIndex);
    setSearch("");
  }

  function saveHomework(title: string, dueDate: string | null) {
    updateHomework((current) => [{
      id: crypto.randomUUID(),
      title,
      subject: dialogSubject ?? "",
      dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
    }, ...current]);
    setDialogSubject(null);
    navigate("/homework");
  }

  function toggleHomework(id: string) {
    const selected = homework.find((item) => item.id === id);
    const completesAll = Boolean(selected && !selected.completed
      && homework.every((item) => item.completed || item.id === id));
    updateHomework((current) => current.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item,
    ));

    if (completesAll && selected) {
      updateProgress((current) => {
        if (current.lastCompletedDate === todayKey) return current;
        return {
          streak: current.lastCompletedDate === yesterdayKey ? current.streak + 1 : 1,
          lastCompletedDate: todayKey,
        };
      });
      setShowCelebration(true);
      window.setTimeout(() => setShowCelebration(false), 3200);
    }
  }

  function deleteHomework(id: string) {
    updateHomework((current) => current.filter((item) => item.id !== id));
  }

  function editHomework(id: string, title: string) {
    updateHomework((current) => current.map((item) => item.id === id ? { ...item, title } : item));
  }

  function startTutoring(item: HomeworkItem) {
    setTutorPrompt(`${item.subject}: ${item.title}`);
    setChatOpen(true);
  }

  function finishTutoring() {
    setTutorPrompt(null);
  }

  function saveProfile(value: typeof profile) {
    updateProfile(() => value);
    setEditProfile(false);
  }

  function savePeriods(value: ClassPeriod[]) {
    updatePeriods(() => value);
    setShowSettings(false);
  }

  return (
    <main className="app-shell" data-theme={theme}>
      <Sidebar onOpenMitticha={() => setChatOpen(true)} />
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <div className="brand mobile-brand">
          <span className="brand-mark"><CalendarDays size={21} /></span>
          <span>Kundalik<span className="brand-dot">.</span></span>
        </div>
        <div className="topbar-meta">
          <span className="school-pill"><span className="school-dot" /> {profile.school} <b>·</b> {profile.grade}</span>
          <span className="topbar-date">{dateLabel}</span>
          <button
            className="theme-toggle"
            type="button"
            onClick={() => updateTheme((current) => current === "light" ? "dark" : "light")}
            aria-label={theme === "light" ? "Qorong'i rejimga o'tish" : "Yorug' rejimga o'tish"}
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button className="avatar-button" type="button" onClick={() => setEditProfile(true)} aria-label="Profilni tahrirlash">
            {profile.name.trim().charAt(0).toLocaleUpperCase("uz") || "O"}
          </button>
        </div>
      </header>

      <div className="dashboard">
        <section className="main-column">
          <motion.section
            className="welcome-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="welcome-copy">
              <span className="eyebrow"><Sun size={14} /> BUGUNGI KAYFIYAT</span>
              <h1>Salom, {profile.name || "o'quvchi"}! <span className="wave">👋</span></h1>
              <p>Yangi kun — yangi imkoniyat. Darslaringni birga rejalashtiramiz!</p>
              <div className="welcome-date"><CalendarDays size={15} /> {dateLabel}</div>
            </div>
            <div className="welcome-art" aria-hidden="true">
              <div className="art-sun" />
              <div className="art-book"><span>✦</span></div>
              <div className="art-sparkle sparkle-a">✦</div>
              <div className="art-sparkle sparkle-b">✧</div>
              <div className="art-orbit" />
            </div>
          </motion.section>

          <div className="view-switch" aria-label="Bo'lim tanlash">
            <button type="button" className={activeView === "schedule" ? "view-switch-active" : ""} onClick={() => navigate("/")}>Jadval</button>
            <button type="button" className={activeView === "homework" ? "view-switch-active" : ""} onClick={() => navigate("/homework")}>
              Vazifalar <span>{todayLessons}</span>
            </button>
            <button type="button" className={activeView === "books" ? "view-switch-active" : ""} onClick={() => navigate("/books")}>
              <BookOpen size={13} /> Kitoblar
            </button>
          </div>

          {activeView === "schedule" ? (
            <section className="schedule-section">
              <div className="schedule-live-row">
                <LiveClock />
                <motion.button
                  key={bellStatusKey}
                  className="bell-status-card"
                  type="button"
                  aria-label={`Mitticha aytadi: ${bellStatusMessage}. Suhbatni ochish`}
                  onClick={() => setChatOpen(true)}
                  initial={{ opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: .24 }}
                >
                  <span className="bell-status-avatar">🐣</span>
                  <span className="bell-status-copy"><b>Mitticha aytadi</b><span>{bellStatusMessage}</span></span>
                  <Sparkles size={16} />
                </motion.button>
              </div>
              <div className="section-heading">
                <div>
                  <span className="eyebrow muted-eyebrow">SENING REJANG</span>
                  <h2>Haftalik jadval <span className="heading-sparkle">✦</span></h2>
                </div>
                <button className="schedule-settings-button" type="button" onClick={() => setShowSettings(true)}>
                  <Settings2 size={15} /><span>Dars vaqtlari</span>
                </button>
              </div>

              <div className="schedule-controls">
                <div className="range-switch" role="group" aria-label="Jadval oralig'i">
                  <button className={scheduleFilter === "today" ? "range-active" : ""} type="button" onClick={() => selectFilter("today")}>Bugun</button>
                  <button className={scheduleFilter === "tomorrow" ? "range-active" : ""} type="button" onClick={() => selectFilter("tomorrow")}>Ertaga</button>
                  <button className={scheduleFilter === "week" ? "range-active" : ""} type="button" onClick={() => selectFilter("week")}>Hafta</button>
                </div>
                {scheduleFilter !== "week" && (
                  <div className="lesson-total"><span>{currentDay.fanlar.length}</span> ta dars</div>
                )}
              </div>

              {scheduleFilter !== "week" && (
                <DayTabs
                  days={week}
                  selectedDay={selectedDay}
                  todayIndex={todayIndex}
                  onSelect={(index) => { setSelectedDay(index); setScheduleFilter("day"); setSearch(""); }}
                />
              )}

              <div className="lessons-toolbar">
                <div className="selected-day-title">
                  <h3>{scheduleFilter === "week" ? "Hafta kunlari" : currentDay.kun}</h3>
                  <span>
                    {scheduleFilter === "today" ? "Bugungi darslar" : scheduleFilter === "tomorrow" ? "Ertangi darslar" : "Darslarni qidirish"}
                  </span>
                </div>
                <label className="search-box">
                  <Search size={16} />
                  <input
                    aria-label="Fanlarni qidirish"
                    placeholder="Fan qidirish..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  {search && <button type="button" onClick={() => setSearch("")} aria-label="Qidiruvni tozalash">×</button>}
                </label>
              </div>

              {scheduleFilter === "week" ? (
                <WeekSchedule
                  days={week}
                  subjects={subjects}
                  periods={periods}
                  currentMinute={currentMinute}
                  todayIndex={todayIndex}
                  todayIsSchoolDay={todayIsSchoolDay}
                  search={search}
                  onAddHomework={setDialogSubject}
                />
              ) : (
                <>
                  {scheduleFilter === "today" && (
                    <div className={`time-status ${todayIsSchoolDay && currentLessonIndex >= 0 ? "time-status-live" : ""}`}>
                      <Clock3 size={15} />
                      {!todayIsSchoolDay ? (
                        <span>Bugun dars yo&apos;q. Yaxshi dam ol!</span>
                      ) : currentLessonIndex >= 0 ? (
                        <span><b>Hozir:</b> {currentDay.fanlar[currentLessonIndex]} darsi davom etmoqda.</span>
                      ) : nextLessonIndex >= 0 ? (
                        <span><b>Keyingi darsgacha</b> {formatRemaining(relevantPeriods[nextLessonIndex].start - currentMinute)} qoldi.</span>
                      ) : (
                        <span>Bugungi darslar yakunlandi — zo&apos;r ishlading!</span>
                      )}
                    </div>
                  )}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedDay}
                      className="lesson-grid"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {(() => {
                        const showBreak = visibleLessons.some(({ index }) => index === 2)
                          && visibleLessons.some(({ index }) => index === 3);
                        return visibleLessons.map(({ name, index }) => {
                          const period = periods[index];
                          if (!period) return null;
                          const isTodaySelected = todayIsSchoolDay && selectedDay === todayIndex;
                          const isCurrent = isTodaySelected && currentLessonIndex === index;
                          return (
                            <div className="day-lesson-group" key={`${currentDay.kun}-${name}-${index}`}>
                              {index === 3 && showBreak && (
                                <div className="large-break-divider"><Coffee size={13} /><span>Katta tanaffus</span><time>10:15 - 10:30</time></div>
                              )}
                              <LessonCard
                                subject={subjects[name]}
                                index={index}
                                period={period}
                                isCurrent={isCurrent}
                                isPast={isTodaySelected && currentMinute >= period.end}
                                isNext={isTodaySelected && upcomingLessonIndex === index}
                                progressPercent={isCurrent
                                  ? Math.min(100, Math.max(0, ((currentMinute - period.start) / (period.end - period.start)) * 100))
                                  : undefined}
                                packageProgress={packsForSubject(name).length > 0 ? (() => {
                                  const pack = packsForSubject(name)[0];
                                  const testDone = testResults.some((result) =>
                                    result.subject === pack.fan && result.topic === pack.mavzu
                                    && localDateKey(new Date(result.date)) === todayKey,
                                  );
                                  const homeworkDone = homework.some((item) =>
                                    item.id === `offline-${pack.uyVazifa.id}-${todayKey}` && item.completed,
                                  );
                                  return { completed: (testDone ? pack.testlar.length : 0) + Number(homeworkDone), total: pack.testlar.length + 1 };
                                })() : undefined}
                                onAddHomework={setDialogSubject}
                              />
                            </div>
                          );
                        });
                      })()}
                      {visibleLessons.length === 0 && (
                        <div className="empty-search">Bu nomda fan topilmadi. Qidiruvni o&apos;zgartirib ko&apos;ring.</div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </>
              )}
            </section>
          ) : activeView === "homework" ? (
            <HomeworkList homework={homework} onToggle={toggleHomework} onDelete={deleteHomework} onTutor={startTutoring} onEdit={editHomework} />
          ) : (
            <BooksGrid subjects={Object.values(subjects)} />
          )}
        </section>

        <aside className="side-column">
          <section className="side-card streak-card">
            <div className="side-card-heading"><span className="side-icon streak-icon"><Flame size={17} /></span><span>O&apos;qish streaki</span></div>
            <div className="streak-number">{visibleStreak}<small> kun</small></div>
            <p>{doneToday ? "Bugungi barcha vazifalar bajarildi!" : "Har kuni oz-ozdan — katta natija!"}</p>
            <div className="streak-badges">
              {visibleStreak >= 7 && <span>🏆 Hafta qahramoni</span>}
              {visibleStreak >= 3 && visibleStreak < 7 && <span>⭐ 3 kunlik nishon</span>}
              {visibleStreak < 3 && <span>✨ Keyingi nishon: 3 kun</span>}
            </div>
          </section>

          <section className="side-card day-summary">
            <div className="side-card-heading"><span className="side-icon purple-icon"><Clock3 size={17} /></span><span>Kun rejasi</span><span className="live-dot" /></div>
            <div className="summary-number">{currentDay.fanlar.length}<small> ta dars</small></div>
            <p>{currentDay.kun} kuni bilimga boy bo&apos;ladi!</p>
            <div className="summary-progress"><span style={{ width: `${Math.min(currentDay.fanlar.length * 12, 72)}%` }} /></div>
            <div className="summary-foot"><span>Rejang tayyor</span><b>{currentDay.qisqa}</b></div>
          </section>

          <section className="mitticha-card">
            <div className="mitticha-avatar">🐣</div>
            <span className="eyebrow">MITTICHADAN</span>
            <h3>Sen uddalaysan!</h3>
            <p>Har bir katta yutuq kichkina qadamdan boshlanadi. Bugun qaysi fanni yoqtirasan?</p>
            <div className="mitticha-footer"><span>Yordamching Mitticha</span><Sparkles size={16} /></div>
          </section>

          <section className="side-note">
            <div className="note-icon"><ArrowUpRight size={17} /></div>
            <div><b>Kichik maslahat</b><p>Darsdan oldin kerakli daftar-kitoblaringni tayyorlab qo&apos;y.</p></div>
          </section>

          <div className="quote-line">“Bilim — kelajakka ochilgan eshik.” <span>✦</span></div>
        </aside>
      </div>

      <AnimatePresence>
        {showCelebration && (
          <motion.div className="completion-celebration" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <span>🎉</span><div><b>Bugun hammasi bajarildi!</b><small>Mitticha sendan faxrlanadi!</small></div><span>✨</span>
          </motion.div>
        )}
      </AnimatePresence>

      <HomeworkDialog subject={dialogSubject} onClose={() => setDialogSubject(null)} onSave={saveHomework} />
      {showSettings && <ScheduleSettingsDialog periods={periods} onClose={() => setShowSettings(false)} onSave={savePeriods} />}
      {profileLoaded && (!profile.name.trim() || editProfile) && (
        <ProfileDialog
          key={`${profile.name}-${profile.school}-${profile.grade}`}
          profile={profile}
          allowClose={Boolean(profile.name.trim())}
          onClose={() => setEditProfile(false)}
          onSave={saveProfile}
        />
      )}
      <Suspense fallback={null}>
        <MittichaChat
          isOpen={chatOpen}
          onOpenChange={(open) => { setChatOpen(open); if (!open) finishTutoring(); }}
          tutorPrompt={tutorPrompt}
          onTutorPromptHandled={() => setTutorPrompt(null)}
          onAutoHomeworkTutor={startTutoring}
          onHomeworkCompletion={(item) => updateHomework((current) => current.some((existing) => existing.id === item.id)
            ? current.map((existing) => existing.id === item.id ? item : existing)
            : [item, ...current])}
          onTestResult={(result) => updateTestResults((current) => [...current, result].slice(-100))}
        />
      </Suspense>
      <footer className="page-footer"><span>Yaxshi reja — kunning yarmi! ✨</span><span>{profile.school} · {profile.grade}</span></footer>
    </main>
  );
}
