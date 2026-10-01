import {
  Atom, BookOpen, BriefcaseBusiness, Calculator, Dumbbell, FlaskConical,
  Globe2, Heart, Landmark, Languages, Laptop, Leaf, Orbit, Scale, Shield,
  Sparkles, Triangle,
} from "lucide-react";
import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import type { Subject } from "@/data/schedule";

const iconByName: Record<string, LucideIcon> = {
  sparkles: Sparkles, calculator: Calculator, flask: FlaskConical, triangle: Triangle,
  dumbbell: Dumbbell, briefcase: BriefcaseBusiness, shield: Shield, atom: Atom,
  leaf: Leaf, languages: Languages, laptop: Laptop, landmark: Landmark,
  "book-open": BookOpen, scale: Scale, globe: Globe2, heart: Heart, orbit: Orbit,
};

// Fan nomidan mos belgini tanlaydi va uning rangini kartaga uzatadi.
export function SubjectIcon({ subject }: { subject: Subject }) {
  const Icon = iconByName[subject.ikonka] ?? BookOpen;
  const style = {
    "--subject-color": `var(--${subject.rang}-color)`,
    "--subject-soft": `var(--${subject.rang}-soft)`,
  } as CSSProperties;

  return <span className="subject-icon" style={style}><Icon size={21} strokeWidth={2.1} /></span>;
}
