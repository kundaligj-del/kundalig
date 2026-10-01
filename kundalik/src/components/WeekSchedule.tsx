import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
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
  search: string;
  onAddHomework: (subject: string) => void;
};

// Hafta filtri darslarni kunlar bo'yicha guruhlab ko'rsatadi.
export function WeekSchedule({ days, subjects, periods, currentMinute, todayIndex, search, onAddHomework }: WeekScheduleProps) {
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
      {filteredDays.map(({ day, lessons }, dayIndex) => (
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
              return (
                <LessonCard
                  key={`${day.kun}-${index}-${name}`}
                  subject={subjects[name]}
                  index={index}
                  period={period}
                  isCurrent={days.findIndex((item) => item.kun === day.kun) === todayIndex
                    && currentMinute >= period.start && currentMinute < period.end}
                  onAddHomework={onAddHomework}
                />
              );
            })}
          </div>
        </motion.section>
      ))}
    </div>
  );
}
