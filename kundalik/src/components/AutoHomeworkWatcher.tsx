import { useCallback, useEffect } from "react";
import { isCalendarSettings, defaultCalendarSettings, isDayOffList, addDays, getDateKey, getSchoolDayIndex } from "@/data/calendar";
import {
  defaultAutoHomeworkSettings, isAutoHomeworkFailure, isAutoHomeworkNotice,
  isAutoHomeworkSettings, type AutoHomeworkNotice,
} from "@/data/autoHomework";
import { isMittichaSettings, defaultMittichaSettings } from "@/data/mittichaSettings";
import { week } from "@/data/schedule";
import { countLessonsBySubject } from "@/utils/lessonCounter";
import {
  buildPrompt, getNextSchoolDay, shouldGenerateNow,
} from "@/utils/autoHomework";
import { parseAutoHomeworkResponse, requestAutoHomework, toHomeworkItems } from "@/services/autoHomework";
import { useHomeworkStorage } from "@/hooks/useHomeworkStorage";
import { usePersistentState } from "@/hooks/usePersistentState";

const LAST_AUTO_DATE_KEY = "lastAutoHomeworkDate";
const LOCK_KEY = "kundalik-auto-homework-lock";
const RETRIES_LIMIT = 3;
const RETRY_WAIT = 15 * 60_000;
const LOCK_LIFETIME = 90_000;

type LockRecord = { id: string; targetDate: string; expiresAt: number };

function isLockRecord(value: unknown): value is LockRecord {
  return typeof value === "object" && value !== null
    && "id" in value && typeof value.id === "string"
    && "targetDate" in value && typeof value.targetDate === "string"
    && "expiresAt" in value && typeof value.expiresAt === "number";
}

function readLock(): LockRecord | null {
  const raw = localStorage.getItem(LOCK_KEY);
  if (!raw) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    localStorage.removeItem(LOCK_KEY);
    return null;
  }
  if (!isLockRecord(value)) {
    localStorage.removeItem(LOCK_KEY);
    return null;
  }
  return value;
}

function readLastAutoDate(): string | null {
  return localStorage.getItem(LAST_AUTO_DATE_KEY);
}

function claimLock(targetDate: string): string | null {
  const now = Date.now();
  const current = readLock();
  if (current && current.expiresAt > now) return null;
  const id = crypto.randomUUID();
  const lock = { id, targetDate, expiresAt: now + LOCK_LIFETIME };
  localStorage.setItem(LOCK_KEY, JSON.stringify(lock));
  return readLock()?.id === id ? id : null;
}

// Ilova ochiq turgan paytda avtomatik vazifani tekshiradi, xatoda ko'pi bilan 3 marta urinadi.
export function AutoHomeworkWatcher() {
  const [settings] = usePersistentState(
    "kundalik-auto-homework-settings", isAutoHomeworkSettings, defaultAutoHomeworkSettings,
  );
  const [calendarSettings] = usePersistentState(
    "kundalik-calendar-settings", isCalendarSettings, defaultCalendarSettings,
  );
  const [daysOff] = usePersistentState("kundalik-days-off", isDayOffList, []);
  const [mittichaSettings] = usePersistentState(
    "kundalik-mitticha-settings", isMittichaSettings, defaultMittichaSettings,
  );
  const [homework, updateHomework] = useHomeworkStorage();
  const [, updateLastAutoDate] = usePersistentState<string | null>(
    LAST_AUTO_DATE_KEY,
    (value): value is string | null => value === null || (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)),
    null,
  );
  const [failure, updateFailure] = usePersistentState(
    "kundalik-auto-homework-retry", isAutoHomeworkFailure, null,
  );
  const [, updateNotice] = usePersistentState<AutoHomeworkNotice | null>(
    "kundalik-auto-homework-notice", isAutoHomeworkNotice, null,
  );

  const reportStatus = useCallback((message: string) => {
    window.dispatchEvent(new CustomEvent("kundalik:auto-homework-status", { detail: message }));
  }, []);

  const generate = useCallback(async (force = false) => {
    const now = new Date();
    if (!shouldGenerateNow(now, settings, force)) return;

    const nextDay = getNextSchoolDay(now, daysOff);
    const retry = failure?.targetDate === nextDay.dateKey ? failure : null;
    if (failure && !retry) updateFailure(() => null);
    if (retry && now.getTime() < retry.nextAttemptAt) return;

    const storedDate = readLastAutoDate();
    const alreadyStored = storedDate === nextDay.dateKey
      || homework.some((item) => item.source === "mitticha" && item.dueDate === nextDay.dateKey);
    if (alreadyStored) {
      if (storedDate !== nextDay.dateKey) updateLastAutoDate(() => nextDay.dateKey);
      if (force) reportStatus("Keyingi dars kuni uchun Mitticha vazifalari allaqachon tayyorlangan.");
      return;
    }
    if (!force && (settings.excludedSubjects.length >= new Set(week[getSchoolDayIndex(nextDay.date)]?.fanlar ?? []).size)) {
      reportStatus("Avtomatik vazifa berish yoqilgan fan tanlanmagan.");
      return;
    }

    const lockId = claimLock(nextDay.dateKey);
    if (!lockId) return;

    const hasLateOpened = now.getHours() * 60 + now.getMinutes()
      > Number(settings.time.slice(0, 2)) * 60 + Number(settings.time.slice(3));
    const attemptNumber = (retry?.attempts ?? 0) + 1;
    try {
      const countThrough = addDays(nextDay.date, -1);
      const lessonCounts = countLessonsBySubject(
        week, calendarSettings.schoolYearStart, countThrough, daysOff.map((item) => item.date),
      );
      const prompt = buildPrompt(
        nextDay, settings, settings.excludedSubjects, mittichaSettings.manualTopics,
        Object.fromEntries(lessonCounts.map((item) => [item.subject, item.total])),
      );
      if (prompt.lessons.length === 0) {
        reportStatus("Avtomatik vazifa uchun fan tanlanmagan.");
        return;
      }

      let tasks;
      let usedFallback = false;
      try {
        const raw = await requestAutoHomework(prompt);
        tasks = parseAutoHomeworkResponse(raw, prompt);
      } catch (error) {
        if (attemptNumber < RETRIES_LIMIT) {
          const message = "Hozir vazifa tuza olmadim, 15 daqiqadan keyin qayta urinaman.";
          updateFailure(() => ({
            targetDate: nextDay.dateKey,
            attempts: attemptNumber,
            nextAttemptAt: Date.now() + RETRY_WAIT,
            message,
          }));
          updateNotice(() => ({
            id: `retry-${nextDay.dateKey}-${attemptNumber}`,
            targetDate: nextDay.dateKey,
            weekday: nextDay.weekday,
            taskCount: 0,
            totalMinutes: 0,
            message,
            kind: "failure",
          }));
          reportStatus(`${message}${error instanceof Error ? ` (${error.message})` : ""}`);
          return;
        }
        usedFallback = true;
        tasks = parseAutoHomeworkResponse("[]", prompt);
      }

      const currentLock = readLock();
      if (currentLock?.id !== lockId || currentLock.targetDate !== nextDay.dateKey
        || readLastAutoDate() === nextDay.dateKey) return;

      const homeworkItems = toHomeworkItems(tasks, nextDay.dateKey);
      updateHomework((current) => {
        const existing = current.filter((item) => !(item.source === "mitticha" && item.dueDate === nextDay.dateKey));
        return [...homeworkItems, ...existing];
      });
      updateLastAutoDate(() => nextDay.dateKey);
      updateFailure(() => null);

      const tomorrow = getDateKey(addDays(now, 1)) === nextDay.dateKey;
      const taskCount = tasks.length;
      const totalMinutes = tasks.reduce((sum, item) => sum + item.daqiqa, 0);
      const prefix = hasLateOpened && !force ? "⏰ 18:00 da tayyorlagandim. " : "";
      const dayTitle = tomorrow ? `Ertangi (${nextDay.weekday})` : `${nextDay.weekday} kungi`;
      const message = usedFallback
        ? `${prefix}📚 ${dayTitle} ${prompt.lessons.length} ta fandan zaxira vazifalar tayyorladim, jami ~${totalMinutes} daqiqa. Mavzuni sozlamalarga kiritsang, keyingisi aniqroq bo'ladi.`
        : `${prefix}📚 Salom! ${dayTitle} ${prompt.lessons.length} ta fandan ${taskCount} ta vazifa tayyorladim, jami ~${totalMinutes} daqiqa. Ko'rib chiqamizmi?`;
      const notice = {
        id: `auto-${nextDay.dateKey}`,
        targetDate: nextDay.dateKey,
        weekday: nextDay.weekday,
        taskCount,
        totalMinutes,
        message,
        kind: usedFallback ? "fallback" as const : "success" as const,
      };
      updateNotice(() => notice);
      reportStatus(message);

      if (settings.browserNotifications && "Notification" in window && Notification.permission === "granted") {
        new Notification("Mitticha uy vazifalari tayyor!", { body: message });
      }
    } catch (error) {
      reportStatus(error instanceof Error ? error.message : "Avtomatik vazifa yaratilmadi.");
    } finally {
      if (readLock()?.id === lockId) localStorage.removeItem(LOCK_KEY);
    }
  }, [
    calendarSettings.schoolYearStart, daysOff, failure, homework, mittichaSettings.manualTopics,
    reportStatus, settings, updateFailure, updateHomework, updateLastAutoDate, updateNotice,
  ]);

  useEffect(() => {
    const check = () => { void generate(); };
    const onManual = () => { void generate(true); };
    check();
    const timer = window.setInterval(check, 30_000);
    window.addEventListener("visibilitychange", check);
    window.addEventListener("kundalik:auto-homework-now", onManual);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("visibilitychange", check);
      window.removeEventListener("kundalik:auto-homework-now", onManual);
    };
  }, [generate]);

  return null;
}
