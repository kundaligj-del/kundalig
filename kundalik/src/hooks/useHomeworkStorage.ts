"use client";

import { isHomeworkList, type HomeworkItem } from "@/data/homework";
import { usePersistentState } from "@/hooks/usePersistentState";

// Vazifalarni umumiy saqlash hooki orqali localStorage'da ushlab turadi.
export function useHomeworkStorage() {
  return usePersistentState<HomeworkItem[]>("kundalik-homework", isHomeworkList, []);
}
