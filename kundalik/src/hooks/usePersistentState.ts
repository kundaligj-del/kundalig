"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const STORAGE_CHANGE_EVENT = "kundalik:storage-change";
const subscribeToHydration = () => () => {};
const getHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

type Validator<T> = (value: unknown) => value is T;

// Bir xil ishonchli localStorage mexanizmini turli ma'lumotlarda qayta ishlatadi.
export function usePersistentState<T>(
  key: string,
  isValid: Validator<T>,
  initialValue: T,
) {
  const initialJson = JSON.stringify(initialValue);
  const subscribe = useCallback((onStoreChange: () => void) => {
    window.addEventListener("storage", onStoreChange);
    window.addEventListener(STORAGE_CHANGE_EVENT, onStoreChange);
    return () => {
      window.removeEventListener("storage", onStoreChange);
      window.removeEventListener(STORAGE_CHANGE_EVENT, onStoreChange);
    };
  }, []);
  const getSnapshot = useCallback(() => window.localStorage.getItem(key) ?? initialJson, [key, initialJson]);
  const getServerSnapshot = useCallback(() => initialJson, [initialJson]);
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydrationSnapshot,
    getServerHydrationSnapshot,
  );

  const value = useMemo(() => {
    const parsed: unknown = JSON.parse(raw);
    if (!isValid(parsed)) throw new Error(`"${key}" xotirasidagi ma'lumot formati noto'g'ri.`);
    return parsed;
  }, [isValid, key, raw]);

  const update = useCallback((change: (current: T) => T) => {
    const parsed: unknown = JSON.parse(getSnapshot());
    if (!isValid(parsed)) throw new Error(`"${key}" xotirasidagi ma'lumot formati noto'g'ri.`);
    const next = change(parsed);
    if (!isValid(next)) throw new Error(`"${key}" uchun yangi ma'lumot formati noto'g'ri.`);
    window.localStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(new Event(STORAGE_CHANGE_EVENT));
  }, [getSnapshot, isValid, key]);

  return [value, update, isHydrated] as const;
}
