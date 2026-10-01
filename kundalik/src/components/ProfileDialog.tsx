"use client";

import { useState, type FormEvent } from "react";
import { UserRound, X } from "lucide-react";
import type { StudentProfile } from "@/data/preferences";

type ProfileDialogProps = {
  profile: StudentProfile;
  allowClose: boolean;
  onClose: () => void;
  onSave: (profile: StudentProfile) => void;
};

// Birinchi kirishda ism so'raydi; maktab va sinfni ham shu oynadan tahrirlash mumkin.
export function ProfileDialog({ profile, allowClose, onClose, onSave }: ProfileDialogProps) {
  const [name, setName] = useState(profile.name);
  const [school, setSchool] = useState(profile.school);
  const [grade, setGrade] = useState(profile.grade);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanSchool = school.trim();
    const cleanGrade = grade.trim();
    if (!cleanName || !cleanSchool || !cleanGrade) return;
    onSave({ name: cleanName, school: cleanSchool, grade: cleanGrade });
  }

  return (
    <div className="dialog-backdrop profile-backdrop">
      <section className="homework-dialog profile-dialog" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        {allowClose && <button className="dialog-close" type="button" onClick={onClose} aria-label="Yopish"><X size={18} /></button>}
        <span className="profile-icon"><UserRound size={20} /></span>
        <span className="eyebrow muted-eyebrow">{allowClose ? "PROFILNI TAHRIRLASH" : "KUNDALIKKA XUSH KELIBSIZ"}</span>
        <h2 id="profile-title">{allowClose ? "Ma'lumotlaring" : "Ismingni aytasanmi?"}</h2>
        <p className="dialog-hint">Jadvalni senga moslab berishimiz uchun kerak bo&apos;ladi.</p>
        <form onSubmit={handleSubmit}>
          <label className="dialog-label" htmlFor="student-name">Isming</label>
          <input id="student-name" className="profile-input" autoFocus required maxLength={50} value={name} onChange={(event) => setName(event.target.value)} placeholder="Masalan: Madina" />
          <label className="dialog-label" htmlFor="student-school">Maktab</label>
          <input id="student-school" className="profile-input" required maxLength={80} value={school} onChange={(event) => setSchool(event.target.value)} />
          <label className="dialog-label" htmlFor="student-grade">Sinf</label>
          <input id="student-grade" className="profile-input" required maxLength={40} value={grade} onChange={(event) => setGrade(event.target.value)} />
          <button className="save-homework" type="submit">{allowClose ? "Saqlash" : "Boshlash"} <span>↗</span></button>
        </form>
      </section>
    </div>
  );
}
