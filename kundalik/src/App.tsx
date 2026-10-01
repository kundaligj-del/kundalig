import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { BellReminderWatcher } from "@/components/BellReminderWatcher";
import { AutoHomeworkWatcher } from "@/components/AutoHomeworkWatcher";
import Home from "@/app/page";
import CalendarPage from "@/app/calendar/page";
import SettingsPage from "@/app/settings/page";
import StatisticsPage from "@/app/statistics/page";

const CalculatorPage = lazy(() => import("@/app/calculator/page"));
const MittichaPage = lazy(() => import("@/app/mitticha/page"));
const TranslatorPage = lazy(() => import("@/app/translator/page"));

// React Router manzilga qarab kerakli sahifani ko'rsatadi.
export default function App() {
  return (
    <>
      <BellReminderWatcher />
      <AutoHomeworkWatcher />
      <Suspense fallback={<div className="route-loading" role="status">Sahifa yuklanmoqda…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/homework" element={<Home />} />
          <Route path="/books" element={<Home />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/mitticha" element={<MittichaPage />} />
          <Route path="/translator" element={<TranslatorPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
