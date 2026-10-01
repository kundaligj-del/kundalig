import type { ReactNode } from "react";
import { CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/Sidebar";
import {
  defaultProfile, getSystemColorTheme, isColorTheme, isStudentProfile,
} from "@/data/preferences";
import { formatUzDate } from "@/data/calendar";
import { usePersistentState } from "@/hooks/usePersistentState";

type RoutePageLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

// Ichki sahifalarning umumiy menyu, header va tema qobig'i.
export function RoutePageLayout({ eyebrow, title, description, children }: RoutePageLayoutProps) {
  const [theme] = usePersistentState<"light" | "dark">(
    "kundalik-theme", isColorTheme, getSystemColorTheme(),
  );
  const [profile] = usePersistentState("kundalik-profile", isStudentProfile, defaultProfile);
  const currentDate = new Date();
  const today = formatUzDate(currentDate, { weekday: "long" });

  return (
    <div className="app-shell secondary-shell" data-theme={theme}>
      <Sidebar />
      <div className="secondary-page">
        <header className="topbar">
          <div className="brand mobile-brand">
            <span className="brand-mark"><CalendarDays size={21} /></span>
            <span>Kundalik<span className="brand-dot">.</span></span>
          </div>
          <div className="topbar-meta">
            <span className="school-pill">{profile.school} <b>·</b> {profile.grade}</span>
            <span className="topbar-date">{today}</span>
          </div>
        </header>
        <motion.main
          className="secondary-content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="secondary-heading">
            <span className="eyebrow muted-eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {children}
        </motion.main>
      </div>
    </div>
  );
}
