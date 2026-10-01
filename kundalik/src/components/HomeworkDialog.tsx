"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, X } from "lucide-react";

type HomeworkDialogProps = {
  subject: string | null;
  onClose: () => void;
  onSave: (title: string, dueDate: string | null) => void;
};

// Dialog darsga vazifa va ixtiyoriy topshirish muddatini bog'laydi.
export function HomeworkDialog({ subject, onClose, onSave }: HomeworkDialogProps) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle || !subject) return;
    onSave(cleanTitle, dueDate || null);
    setTitle("");
    setDueDate("");
  }

  return (
    <AnimatePresence>
      {subject && (
        <motion.div
          className="dialog-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
        >
          <motion.section
            className="homework-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="homework-dialog-title"
            initial={{ opacity: 0, y: 18, scale: .97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: .98 }}
          >
            <button className="dialog-close" type="button" onClick={onClose} aria-label="Yopish"><X size={18} /></button>
            <span className="eyebrow muted-eyebrow">YANGI VAZIFA</span>
            <h2 id="homework-dialog-title">{subject}</h2>
            <p className="dialog-hint">Vazifani yozib qo&apos;y — esingdan chiqib qolmaydi!</p>
            <form onSubmit={handleSubmit}>
              <label className="dialog-label" htmlFor="homework-title">Vazifa nima?</label>
              <textarea
                id="homework-title"
                autoFocus
                required
                maxLength={240}
                rows={3}
                placeholder="Masalan: 25-mashqni yechish"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
              <label className="dialog-label" htmlFor="homework-due">Topshirish muddati <span>(ixtiyoriy)</span></label>
              <div className="date-input-wrap"><CalendarDays size={16} /><input id="homework-due" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></div>
              <button className="save-homework" type="submit">Vazifani saqlash <span>↗</span></button>
            </form>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
