"use client";

import { useState, type FormEvent } from "react";
import { RotateCcw, X } from "lucide-react";
import { defaultPeriods, formatClock, parseClock, type ClassPeriod } from "@/data/preferences";

type ScheduleSettingsDialogProps = {
  periods: ClassPeriod[];
  onClose: () => void;
  onSave: (periods: ClassPeriod[]) => void;
};

// Har bir dars boshlanishi va tugashini sozlash uchun jadval beradi.
export function ScheduleSettingsDialog({ periods, onClose, onSave }: ScheduleSettingsDialogProps) {
  const [draft, setDraft] = useState(periods);
  const invalidTime = draft.some((period, index) =>
    period.start >= period.end || (index > 0 && period.start < draft[index - 1].end),
  );

  function updateTime(index: number, key: keyof ClassPeriod, value: string) {
    if (!/^\d{2}:\d{2}$/.test(value)) return;
    const minutes = parseClock(value);
    setDraft((current) => current.map((period, periodIndex) =>
      periodIndex === index ? { ...period, [key]: minutes } : period,
    ));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!invalidTime) onSave(draft);
  }

  return (
    <div className="dialog-backdrop settings-backdrop">
      <section className="homework-dialog settings-dialog" role="dialog" aria-modal="true" aria-labelledby="schedule-settings-title">
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Yopish"><X size={18} /></button>
        <span className="eyebrow muted-eyebrow">JADVAL SOZLAMALARI</span>
        <h2 id="schedule-settings-title">Dars vaqtlarini sozla</h2>
        <p className="dialog-hint">Standart: 08:00 dan, 45 daqiqa dars va 5 daqiqa tanaffus.</p>
        <form onSubmit={handleSubmit}>
          <div className="period-settings-list">
            {draft.map((period, index) => (
              <div className="period-setting-row" key={index}>
                <span>{index + 1}-dars</span>
                <input
                  aria-label={`${index + 1}-dars boshlanish vaqti`}
                  type="time"
                  value={formatClock(period.start)}
                  onChange={(event) => updateTime(index, "start", event.target.value)}
                  required
                />
                <span className="period-separator">—</span>
                <input
                  aria-label={`${index + 1}-dars tugash vaqti`}
                  type="time"
                  value={formatClock(period.end)}
                  onChange={(event) => updateTime(index, "end", event.target.value)}
                  required
                />
              </div>
            ))}
          </div>
          {invalidTime && <p className="settings-error">Darslar ustma-ust kelmasin va tugash vaqti boshlanishidan keyin bo&apos;lsin.</p>}
          <button className="restore-periods" type="button" onClick={() => setDraft(defaultPeriods)}>
            <RotateCcw size={13} /> Standart vaqtlarni tiklash
          </button>
          <button className="save-homework" type="submit" disabled={invalidTime}>Vaqtlarni saqlash <span>↗</span></button>
        </form>
      </section>
    </div>
  );
}
