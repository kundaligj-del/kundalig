"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen, Bot, Calculator, CalendarDays, ChartNoAxesColumnIncreasing,
  CheckSquare, GraduationCap, House, Menu, Moon, Settings, Sun, X,
  Languages,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getSystemColorTheme, isColorTheme } from "@/data/preferences";
import { usePersistentState } from "@/hooks/usePersistentState";

type NavigationItem = { to: string; label: string; icon: LucideIcon };

const navigationItems: NavigationItem[] = [
  { to: "/", label: "Bosh sahifa", icon: House },
  { to: "/calendar", label: "Kalendar", icon: CalendarDays },
  { to: "/homework", label: "Uy vazifalari", icon: CheckSquare },
  { to: "/books", label: "Kitoblar", icon: BookOpen },
  { to: "/translator", label: "Tarjimon", icon: Languages },
  { to: "/calculator", label: "Kalkulyator", icon: Calculator },
  { to: "/mitticha", label: "Mitticha", icon: Bot },
  { to: "/statistics", label: "Statistika", icon: ChartNoAxesColumnIncreasing },
  { to: "/settings", label: "Sozlamalar", icon: Settings },
];

type SidebarProps = { onOpenMitticha?: () => void };

// Desktop sidebar, telefondagi ochiladigan menyu va pastki navigatsiya.
export function Sidebar({ onOpenMitticha }: SidebarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, updateTheme] = usePersistentState<"light" | "dark">(
    "kundalik-theme", isColorTheme, getSystemColorTheme(),
  );

  function toggleTheme() {
    updateTheme((current) => current === "light" ? "dark" : "light");
  }

  function isActive(item: NavigationItem) {
    return location.pathname === item.to;
  }

  function renderLink(item: NavigationItem, mobile = false) {
    const Icon = item.icon;
    return (
      <Link
        className={`sidebar-link ${isActive(item) ? "sidebar-link-active" : ""}`}
        key={item.to}
        to={item.to}
        title={item.label}
        aria-current={isActive(item) ? "page" : undefined}
        onClick={() => mobile && setIsMenuOpen(false)}
      >
        <Icon size={18} strokeWidth={2} />
        <span className="sidebar-nav-label">{item.label}</span>
        {isActive(item) && <i className="sidebar-active-mark" />}
      </Link>
    );
  }

  return (
    <>
      <aside className="desktop-sidebar" aria-label="Asosiy menyu">
        <Link className="sidebar-brand" to="/" aria-label="Kundalik bosh sahifa">
          <span className="sidebar-brand-mark"><GraduationCap size={20} /></span>
          <span className="sidebar-logo-text">Kundalik<span>.</span></span>
        </Link>
        <span className="sidebar-section-label">MENYU</span>
        <nav className="sidebar-links">{navigationItems.map((item) => renderLink(item))}</nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span>🐣</span>
            <div><b>Mitticha aytadi</b><small>Har kuni bir qadam!</small></div>
          </div>
          <button className="sidebar-theme-button" type="button" onClick={toggleTheme}>
            {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
            <span className="sidebar-nav-label">{theme === "light" ? "Qorong'i tema" : "Yorug' tema"}</span>
          </button>
        </div>
      </aside>

      <button
        className="mobile-menu-toggle"
        type="button"
        aria-label={isMenuOpen ? "Menyuni yopish" : "Menyuni ochish"}
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="mobile-menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => { if (event.target === event.currentTarget) setIsMenuOpen(false); }}
          >
            <motion.aside
              className="mobile-menu-panel"
              aria-label="Mobil menyu"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: .22 }}
            >
              <div className="mobile-menu-heading">
                <Link className="sidebar-brand" to="/" onClick={() => setIsMenuOpen(false)}>
                  <span className="sidebar-brand-mark"><GraduationCap size={20} /></span>
                  <span className="sidebar-logo-text">Kundalik<span>.</span></span>
                </Link>
                <button type="button" onClick={() => setIsMenuOpen(false)} aria-label="Menyuni yopish"><X size={18} /></button>
              </div>
              <span className="sidebar-section-label">MENYU</span>
              <nav className="sidebar-links">{navigationItems.map((item) => renderLink(item, true))}</nav>
              <button className="sidebar-theme-button" type="button" onClick={toggleTheme}>
                {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
                <span>{theme === "light" ? "Qorong'i tema" : "Yorug' tema"}</span>
              </button>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="mobile-bottom-nav" aria-label="Asosiy bo'limlar">
        <Link className={location.pathname === "/" ? "mobile-nav-active" : ""} to="/">
          <CalendarDays size={18} /><span>Jadval</span>
        </Link>
        <Link className={location.pathname === "/homework" ? "mobile-nav-active" : ""} to="/homework">
          <CheckSquare size={18} /><span>Vazifalar</span>
        </Link>
        <Link className={location.pathname === "/books" ? "mobile-nav-active" : ""} to="/books">
          <BookOpen size={18} /><span>Kitoblar</span>
        </Link>
        <button type="button" onClick={() => onOpenMitticha ? onOpenMitticha() : navigate("/mitticha")}>
          <Bot size={18} /><span>Mitticha</span>
        </button>
      </nav>
    </>
  );
}
