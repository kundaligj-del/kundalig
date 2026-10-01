import { BookOpen, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { formatClock, type ClassPeriod } from "@/data/preferences";
import type { Subject } from "@/data/schedule";
import { SubjectIcon } from "@/components/SubjectIcon";

type LessonCardProps = {
  subject: Subject;
  index: number;
  period: ClassPeriod;
  isCurrent: boolean;
  onAddHomework: (subject: string) => void;
};

// Bitta dars kartochkasida vaqt va hozirgi dars belgisi ham ko'rinadi.
export function LessonCard({ subject, index, period, isCurrent, onAddHomework }: LessonCardProps) {
  return (
    <motion.article
      className={`lesson-card ${isCurrent ? "lesson-current" : ""}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.055 }}
      whileHover={{ y: -4 }}
    >
      <span className="lesson-number">{String(index + 1).padStart(2, "0")}</span>
      {isCurrent && <span className="lesson-now">Hozir</span>}
      <SubjectIcon subject={subject} />
      <div className="lesson-copy">
        <span className="lesson-label">DARS {index + 1}</span>
        <h3>{subject.nomi}</h3>
        <span className="lesson-time">{formatClock(period.start)} — {formatClock(period.end)}</span>
      </div>
      <div className="lesson-actions">
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
