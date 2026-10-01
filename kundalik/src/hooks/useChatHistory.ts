import { useCallback, useEffect, useState } from "react";

export type LocalChatMessage = {
  id: string;
  kim: "user" | "mitticha";
  matn: string;
  vaqt: string;
};

const STORAGE_KEY = "kundalik-mitticha-chat";
const HISTORY_LIMIT = 200;

function readHistory(): LocalChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is LocalChatMessage =>
      typeof item === "object" && item !== null
      && "id" in item && typeof item.id === "string"
      && "kim" in item && (item.kim === "user" || item.kim === "mitticha")
      && "matn" in item && typeof item.matn === "string"
      && "vaqt" in item && typeof item.vaqt === "string",
    ).slice(-HISTORY_LIMIT);
  } catch {
    return [];
  }
}

// Chat tarixini xavfsiz o'qiydi, saqlaydi va oxirgi 200 xabar bilan cheklaydi.
export function useChatHistory() {
  const [messages, setMessages] = useState<LocalChatMessage[]>(readHistory);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-HISTORY_LIMIT)));
    } catch {
      // Xotira to'la yoki yopiq bo'lsa ham chat ishlashda davom etadi.
    }
  }, [messages]);

  const addMessage = useCallback((kim: LocalChatMessage["kim"], matn: string) => {
    const message = { id: crypto.randomUUID(), kim, matn, vaqt: new Date().toISOString() };
    setMessages((current) => [...current, message].slice(-HISTORY_LIMIT));
    return message;
  }, []);

  const removeMessage = useCallback((id: string) => {
    setMessages((current) => current.filter((message) => message.id !== id));
  }, []);

  const clearHistory = useCallback(() => setMessages([]), []);

  return { messages, addMessage, removeMessage, clearHistory };
}
