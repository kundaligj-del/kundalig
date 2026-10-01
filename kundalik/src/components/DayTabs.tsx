"use client";

import { motion } from "framer-motion";

type DayTabsProps = {
  selectedDay: number;
  todayIndex: number;
  onSelect: (index: number) => void;
  days: { kun: string; qisqa: string; fanlar: string[] }[];
};

// Kun tablari tanlangan va bugungi kunni alohida ko'rsatadi.
export function DayTabs({ selectedDay, todayIndex, onSelect, days }: DayTabsProps) {
  return (
    <div className="day-tabs" role="tablist" aria-label="Hafta kunlari">
      {days.map((day, index) => (
        <button
          className={`day-tab ${selectedDay === index ? "day-tab-active" : ""}`}
          key={day.kun}
          onClick={() => onSelect(index)}
          role="tab"
          aria-selected={selectedDay === index}
        >
          <span>{day.qisqa}</span>
          <span className="day-tab-count">{day.fanlar.length} dars</span>
          {todayIndex === index && <i className="today-dot" aria-label="Bugun" />}
          {selectedDay === index && (
            <motion.span className="day-tab-indicator" layoutId="day-indicator" />
          )}
        </button>
      ))}
    </div>
  );
}
