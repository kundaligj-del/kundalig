"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, Sparkles, X } from "lucide-react";
import type { HomeworkItem } from "@/data/homework";
import { isChatHistory, type ChatMessage } from "@/data/chat";
import { askMitticha } from "@/services/ai";
import { usePersistentState } from "@/hooks/usePersistentState";

const quickPrompts = [
  { label: "Bugungi uy vazifam", prompt: "Bugungi uy vazifalarim bo'yicha menga yordam ber." },
  { label: "Mavzuni tushuntir", prompt: "Bir mavzuni sodda qilib tushuntirib ber. Avval qaysi fanni o'rganayotganimni so'ra." },
  { label: "Test tuz", prompt: "Menga qisqa test tuz. Avval qaysi fan va mavzudan test kerakligini so'ra." },
  { label: "Maslahat ber", prompt: "Bugungi o'qishim uchun menga qisqa, foydali maslahat ber." },
];

type MittichaChatProps = {
  homework: HomeworkItem[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

// Suzuvchi chat oynasi tarixni saqlaydi va javobni serverdagi AI xizmatidan oladi.
export function MittichaChat({ homework, isOpen, onOpenChange }: MittichaChatProps) {
  const [messages, updateMessages] = usePersistentState<ChatMessage[]>("kundalik-mitticha-chat", isChatHistory, []);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const endOfMessages = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessages.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading, isOpen]);

  async function sendMessage(rawText: string) {
    const content = rawText.trim();
    if (!content || isLoading) return;

    const message: ChatMessage = { id: crypto.randomUUID(), role: "user", content };
    const conversation = [...messages, message];
    updateMessages(() => conversation.slice(-80));
    setInput("");
    setIsLoading(true);

    try {
      const answer = await askMitticha(conversation.slice(-20));
      const reply: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: answer };
      updateMessages((current) => [...current, reply].slice(-80));
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Noma'lum xatolik yuz berdi.";
      const errorReply: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Hozir javob bera olmadim: ${reason}`,
      };
      updateMessages((current) => [...current, errorReply].slice(-80));
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function promptFor(label: string, prompt: string) {
    if (label !== "Bugungi uy vazifam") {
      void sendMessage(prompt);
      return;
    }
    const active = homework.filter((item) => !item.completed);
    const summary = active.length
      ? active.map((item) => `${item.subject}: ${item.title}`).join("; ")
      : "Hozircha bajarilmagan vazifam yo'q.";
    void sendMessage(`${prompt} Mening vazifalarim: ${summary}`);
  }

  return (
    <div className="mitticha-widget">
      <AnimatePresence>
        {isOpen && (
          <motion.section
            className="chat-panel"
            role="dialog"
            aria-label="Mitticha bilan suhbat"
            initial={{ opacity: 0, y: 16, scale: .96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: .97 }}
            transition={{ duration: .18 }}
          >
            <header className="chat-header">
              <div className="chat-avatar"><span>🐣</span><i /></div>
              <div className="chat-heading"><b>Mitticha</b><span>O&apos;qishdagi do&apos;sting</span></div>
              <button type="button" className="chat-close" onClick={() => onOpenChange(false)} aria-label="Chatni yopish"><X size={18} /></button>
            </header>

            <div className="chat-messages" role="log" aria-live="polite">
              {messages.length === 0 && (
                <div className="chat-welcome">
                  <span className="chat-welcome-sparkle"><Sparkles size={17} /></span>
                  <h3>Salom! Men Mittichaman 👋</h3>
                  <p>Qaysi mavzu biroz qiyin tuyulyapti? Birga uddalaymiz!</p>
                </div>
              )}
              {messages.map((message) => (
                <div className={`chat-message chat-${message.role}`} key={message.id}>
                  {message.role === "assistant" && <span className="message-avatar">🐣</span>}
                  <p>{message.content}</p>
                </div>
              ))}
              {isLoading && (
                <div className="chat-message chat-assistant">
                  <span className="message-avatar">🐣</span>
                  <p className="typing-indicator"><span /><span /><span /><em>Mitticha yozmoqda...</em></p>
                </div>
              )}
              <div ref={endOfMessages} />
            </div>

            <div className="quick-prompts" aria-label="Tezkor savollar">
              {quickPrompts.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  disabled={isLoading}
                  onClick={() => promptFor(item.label, item.prompt)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <form className="chat-input-row" onSubmit={handleSubmit}>
              <input
                aria-label="Mittichaga xabar yozish"
                maxLength={3000}
                placeholder="Savolingni shu yerga yoz..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
              <button type="submit" disabled={!input.trim() || isLoading} aria-label="Xabarni yuborish">
                <Send size={16} />
              </button>
            </form>
            <p className="chat-safety-note"><Bot size={12} /> Mitticha yo&apos;l ko&apos;rsatadi, javobni o&apos;zing topasan!</p>
          </motion.section>
        )}
      </AnimatePresence>
      <motion.button
        className="mitticha-launcher"
        type="button"
        aria-label={isOpen ? "Mitticha chatini yopish" : "Mitticha bilan suhbatni ochish"}
        aria-expanded={isOpen}
        onClick={() => onOpenChange(!isOpen)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: .94 }}
      >
        {isOpen ? <X size={23} /> : <span className="launcher-face">🐣</span>}
        {!isOpen && <span className="launcher-sparkle">✦</span>}
      </motion.button>
    </div>
  );
}
