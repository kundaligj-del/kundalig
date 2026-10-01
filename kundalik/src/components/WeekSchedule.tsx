import { motion } from "framer-motion";
import { Fragment } from "react";
import { BookOpen, Coffee } from "lucide-react";
import type { ClassPeriod } from "@/data/preferences";
import type { Subject } from "@/data/schedule";
import { LessonCard } from "@/components/LessonCard";

type WeekDay = { kun: string; qisqa: string; fanlar: string[] };
type WeekScheduleProps = {
  days: WeekDay[];
  subjects: Record<string, Subject>;
  periods: ClassPeriod[];
  currentMinute: number;
  todayIndex: number;
  todayIsSchoolDay: boolean;
  search: string;
  onAddHomework: (subject: string) => void;
};

// Hafta filtri darslarni kunlar bo'yicha guruhlab ko'rsatadi.
export function WeekSchedule({ days, subjects, periods, currentMinute, todayIndex, todayIsSchoolDay, search, onAddHomework }: WeekScheduleProps) {
  const normalizedSearch = search.toLocaleLowerCase("uz");
  const filteredDays = days.map((day) => ({
    day,
    lessons: day.fanlar
      .map((name, index) => ({ name, index }))
      .filter(({ name }) => name.toLocaleLowerCase("uz").includes(normalizedSearch)),
  })).filter(({ lessons }) => lessons.length > 0);

  if (filteredDays.length === 0) {
    return <div className="empty-search">Bu nomda fan topilmadi. Qidiruvni o&apos;zgartirib ko&apos;ring.</div>;
  }

  return (
    <div className="week-overview">
      {filteredDays.map(({ day, lessons }, dayIndex) => {
        const scheduleDayIndex = days.findIndex((item) => item.kun === day.kun);
        const isToday = todayIsSchoolDay && scheduleDayIndex === todayIndex;
        const currentIndex = isToday
          ? day.fanlar.findIndex((_, index) => {
            const period = periods[index];
            return period && currentMinute >= period.start && currentMinute < period.end;
          })
          : -1;
        const nextIndex = isToday
          ? (currentIndex >= 0
            ? currentIndex + 1
            : day.fanlar.findIndex((_, index) => periods[index]?.start > currentMinute))
          : -1;
        const showBreak = lessons.some(({ index }) => index === 2) && lessons.some(({ index }) => index === 3);

        return (
          <motion.section
            className="week-day-card"
            key={day.kun}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .25, delay: dayIndex * .035 }}
          >
            <div className="week-day-heading">
              <span className="week-day-icon"><BookOpen size={15} /></span>
              <h3>{day.kun}</h3>
              <span>{lessons.length} dars</span>
            </div>
            <div className="week-day-lessons">
              {lessons.map(({ name, index }) => {
                const period = periods[index];
                if (!period) return null;
                return (
                  <Fragment key={`${day.kun}-${index}-${name}`}>
                    {index === 3 && showBreak && (
                      <div className="large-break-divider"><Coffee size={13} /><span>Katta tanaffus</span><time>10:15 - 10:30</time></div>
                    )}
                    <LessonCard
                      subject={subjects[name]}
                      index={index}
                      period={period}
                      isCurrent={isToday && currentIndex === index}
                      isPast={isToday && currentMinute >= period.end}
                      isNext={isToday && nextIndex === index}
                      progressPercent={currentIndex === index
                        ? Math.min(100, Math.max(0, ((currentMinute - period.start) / (period.end - period.start)) * 100))
                        : undefined}
                      onAddHomework={onAddHomework}
                    />
                  </Fragment>
                );
              })}
            </div>
          </motion.section>
        );
      })}
    </div>
  );
}
