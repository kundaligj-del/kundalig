import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { daysBetweenDateKeys, getDateKey } from "@/data/calendar";
import { Bot, Check, Clock3, Pencil, Save, Trash2, X } from "lucide-react";
import type { HomeworkItem } from "@/data/homework";

type HomeworkListProps = {
  homework: HomeworkItem[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onTutor: (item: HomeworkItem) => void;
  onEdit: (id: string, title: string) => void;
};

function daysUntil(date: string): number {
  return daysBetweenDateKeys(getDateKey(new Date()), date);
}

function displayDate(date: string): string {
  const [year, month, day] = date.split("-");
  return `${day}.${month}.${year}`;
}

// Bajarilmagan vazifalarni yuqoriga, yaqin muddatlilarni qizil rangga chiqaradi.
export function HomeworkList({ homework, onToggle, onDelete, onTutor, onEdit }: HomeworkListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const sorted = [...homework].sort((a, b) => {
    if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
    if (!a.dueDate) return b.dueDate ? 1 : 0;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });
  const activeCount = homework.filter((item) => !item.completed).length;

  return (
    <section className="homework-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow muted-eyebrow">HAMMASI NAZORATDA</span>
          <h2>Uy vazifalari <span className="heading-sparkle">✦</span></h2>
        </div>
        <div className="lesson-total"><span>{activeCount}</span> ta bajarilmagan</div>
      </div>

      {sorted.length === 0 ? (
        <div className="homework-empty">
          <div className="empty-emoji">📝</div>
          <h3>Hozircha vazifa yo&apos;q!</h3>
          <p>Jadvaldagi dars kartasidan vazifa qo&apos;shsang, shu yerda ko&apos;rinadi.</p>
        </div>
      ) : (
        <div className="homework-list">
          <AnimatePresence initial={false}>
            {sorted.map((item, index) => {
              const remainingDays = item.dueDate ? daysUntil(item.dueDate) : null;
              const isUrgent = !item.completed && remainingDays !== null && remainingDays <= 2;
              return (
                <motion.article
                  className={`homework-item ${item.completed ? "homework-completed" : ""} ${isUrgent ? "homework-urgent" : ""}`}
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 18 }}
                  transition={{ duration: .2, delay: index * .025 }}
                >
                  <button
                    type="button"
                    className={`homework-check ${item.completed ? "checked" : ""}`}
                    onClick={() => onToggle(item.id)}
                    aria-label={item.completed ? "Bajarildi belgisini olib tashlash" : "Vazifa bajarildi deb belgilash"}
                  >
                    {item.completed && <Check size={15} />}
                  </button>
                  <div className="homework-item-copy">
                    <span className="homework-subject">{item.subject}</span>
                    {editingId === item.id ? (
                      <input
                        className="homework-edit-input"
                        aria-label={`${item.subject} vazifasini tahrirlash`}
                        maxLength={400}
                        value={editedTitle}
                        onChange={(event) => setEditedTitle(event.target.value)}
                      />
                    ) : <h3>{item.title}</h3>}
                    {item.taskType && <span className="homework-task-type">{item.taskType}</span>}
                    {item.dueDate && (
                      <span className="homework-deadline">
                        <Clock3 size={12} />
                        {remainingDays !== null && remainingDays < 0 ? "Muddati o'tgan · " : "Muddat · "}
                        {displayDate(item.dueDate)}
                      </span>
                    )}
                    {item.difficulty && item.estimatedMinutes && (
                      <span className="homework-ai-meta">
                        {item.difficulty === "oson" ? "Oson" : item.difficulty === "orta" ? "O'rta" : "Qiyin"}
                        <span>·</span>{item.estimatedMinutes} daqiqa
                      </span>
                    )}
                    {item.source === "mitticha" && <span className="homework-source">🤖 Mitticha berdi</span>}
                  </div>
                  <div className="homework-item-actions">
                    {editingId === item.id ? (
                      <>
                        <button type="button" className="homework-help-button" disabled={!editedTitle.trim()} onClick={() => {
                          onEdit(item.id, editedTitle.trim());
                          setEditingId(null);
                        }}><Save size={14} /><span>Saqlash</span></button>
                        <button type="button" className="delete-homework" onClick={() => setEditingId(null)} aria-label="Tahrirlashni bekor qilish"><X size={15} /></button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="homework-help-button"
                          onClick={() => onTutor(item)}
                          aria-label={`${item.title} vazifasini Mitticha bilan yechish`}
                        >
                          <Bot size={14} /><span>Mitticha bilan yechish</span>
                        </button>
                        <button type="button" className="delete-homework" onClick={() => {
                          setEditedTitle(item.title);
                          setEditingId(item.id);
                        }} aria-label={`${item.title} vazifasini tahrirlash`}><Pencil size={14} /></button>
                      </>
                    )}
                    <button type="button" className="delete-homework" onClick={() => onDelete(item.id)} aria-label={`${item.title} vazifasini o'chirish`}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
