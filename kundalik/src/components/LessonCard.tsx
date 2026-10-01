import { BookOpen, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { formatClock, type ClassPeriod } from "@/data/preferences";
import type { Subject } from "@/data/schedule";
import { SubjectIcon } from "@/components/SubjectIcon";
import { useNavigate } from "react-router-dom";

type LessonCardProps = {
  subject: Subject;
  index: number;
  period: ClassPeriod;
  isCurrent: boolean;
  isPast: boolean;
  isNext: boolean;
  progressPercent?: number;
  onAddHomework: (subject: string) => void;
  packageProgress?: { completed: number; total: number };
};

// Bitta dars kartochkasida vaqt va hozirgi dars belgisi ham ko'rinadi.
export function LessonCard({
  subject, index, period, isCurrent, isPast, isNext, progressPercent, onAddHomework, packageProgress,
}: LessonCardProps) {
  const navigate = useNavigate();
  return (
    <motion.article
      className={`lesson-card ${isCurrent ? "lesson-current" : ""} ${isPast ? "lesson-past" : ""}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.055 }}
      whileHover={{ y: -4 }}
    >
      <span className="lesson-number">{String(index + 1).padStart(2, "0")}</span>
      {isCurrent && <span className="lesson-now">HOZIR</span>}
      {!isCurrent && isNext && <span className="lesson-next">Keyingi</span>}
      <SubjectIcon subject={subject} />
      <div className="lesson-copy">
        <span className="lesson-label">DARS {index + 1}</span>
        <h3>{subject.nomi}</h3>
        <span className="lesson-time">{index + 1}-dars · {formatClock(period.start)} - {formatClock(period.end)}</span>
        {isCurrent && (
          <div
            className="lesson-live-progress"
            role="progressbar"
            aria-label={`${index + 1}-darsning o'tgan vaqti`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercent ?? 0}
          >
            <i style={{ width: `${progressPercent ?? 0}%` }} />
          </div>
        )}
      </div>
      <div className="lesson-actions">
        {packageProgress && (
          <div className="lesson-pack-progress" aria-label={`${packageProgress.completed} / ${packageProgress.total} kunlik paket bajarildi`}>
            <span>10 test + 1 vazifa</span>
            <div><i style={{ width: `${packageProgress.completed / packageProgress.total * 100}%` }} /></div>
            <small>{packageProgress.completed}/{packageProgress.total}</small>
          </div>
        )}
        {(subject.nomi === "Ingliz tili" || subject.nomi === "Rus tili") && (
          <button className="lesson-book-link" type="button" onClick={() => navigate("/translator?from=EN&to=UZ")}>
            🌐 So'zlarni tarjima qil
          </button>
        )}
        <a className="lesson-book-link" href={subject.darslikUrl} target="_blank" rel="noopener noreferrer">
          <BookOpen size={12} /> Darslik
        </a>
        <button className="add-homework-button" type="button" onClick={() => onAddHomework(subject.nomi)}>
          <Plus size={13} /> Vazifa qo&apos;shish
        </button>
      </div>
    </motion.article>
  );
}
