"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpenText, Bot, Check, ChevronRight, Clock3, Download, Eraser, ImagePlus, Mic, MicOff, Search, Send, Sparkles, Trash2, Volume2, VolumeX, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
import { Link, useNavigate } from "react-router-dom";
import { getDateKey, getSchoolDayIndex, addDays, type DayOff, type CalendarSettings, defaultCalendarSettings, isCalendarSettings, isDayOffList } from "@/data/calendar";
import { explanations } from "@/data/explanations";
import { allPacks, findPack, packsForSubject } from "@/data/packs";
import type { PackQuestion, StudyPack } from "@/data/packs/types";
import { topicsForSubject } from "@/data/topics";
import { isTestResults, type TestResult } from "@/data/testResults";
import { defaultMittichaSettings, isMittichaSettings } from "@/data/mittichaSettings";
import { defaultPeriods, isClassPeriodList, isLegacyDefaultPeriods, type ClassPeriod } from "@/data/preferences";
import { week } from "@/data/schedule";
import { useChatHistory, type LocalChatMessage } from "@/hooks/useChatHistory";
import { useHomeworkStorage } from "@/hooks/useHomeworkStorage";
import type { HomeworkItem } from "@/data/homework";
import { usePersistentState } from "@/hooks/usePersistentState";
import { matchSmallTalk, normalizeText } from "@/utils/matcher";
import { countLessonsBySubject } from "@/utils/lessonCounter";
import { respondOffline } from "@/services/mitticha";
import { findDictionaryEntries } from "@/services/translate";
import type { TranslatorLanguage } from "@/data/dictionary";
import { requestStudyPlan, type StudyPlanItem } from "@/services/studyPlanner";
import { getDueWeakTopics, isWeakTopicList, recordWeakTopicFailure, recordWeakTopicSuccess, type WeakTopic } from "@/data/weakTopics";
import { requestWritingReview, writingSubjects, type WritingSubject } from "@/services/writingReview";
import { requestHomeworkImage } from "@/services/homeworkImage";
import { defaultBellReminderSettings, isBellReminderSettings } from "@/data/bellReminders";
import { formatBellStatusMessage, getCurrentStatus } from "@/utils/bellTime";
import { isAutoHomeworkNotice } from "@/data/autoHomework";

type Flow = "menu" | "test-subject" | "test-topic" | "exam-subject" | "exam-topic" | "homework-subject" | "homework-topic" | "explain-subject" | "explain-topic" | "writing-subject" | "writing-editor" | "image-upload" | "review";
type QuizState = {
  pack: StudyPack;
  questions: PackQuestion[];
  index: number;
  score: number;
  wrongIds: string[];
  stage: "question" | "feedback" | "done";
  lastCorrect: boolean;
  hintOpen: boolean;
  review: boolean;
  examMode: boolean;
  weakTopicId: string | null;
};
type UnknownMessage = { text: string; time: string };
// Ovoz tanish brauzerlar orasida farq qilgani uchun kerakli API qisminigina tiplaymiz.
type SpeechRecognitionResultItem = { isFinal: boolean; 0: { transcript: string } };
type SpeechRecognitionResultEvent = Event & { resultIndex: number; results: ArrayLike<SpeechRecognitionResultItem> };
type SpeechRecognitionErrorEvent = Event & { error: string };
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const mainButtons = [
  { label: "Bugungi rejam", icon: Clock3, action: "planner" },
  { label: "Imtihon rejimi", icon: Clock3, action: "exam" },
  { label: "Test tuz", icon: Sparkles, action: "test" },
  { label: "Uy vazifasi ber", icon: BookOpenText, action: "homework" },
  { label: "Mavzuni tushuntir", icon: BookOpenText, action: "explain" },
  { label: "Yozma ishni tekshir", icon: BookOpenText, action: "writing" },
  { label: "Rasmdan vazifa", icon: ImagePlus, action: "image" },
  { label: "Xatolar ustida ishlash", icon: Check, action: "review" },
] as const;

const MAX_SOURCE_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_COMPRESSED_IMAGE_BYTES = 700_000;
const MAX_IMAGE_DIMENSION = 1280;

async function compressHomeworkImage(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("JPG, PNG yoki WebP surat tanla. HEIC formatini avval JPG ga aylantir.");
  }
  if (file.size > MAX_SOURCE_IMAGE_BYTES) {
    throw new Error("Surat 8 MB dan katta. Kichikroq rasm tanla.");
  }
  if (typeof createImageBitmap !== "function") {
    throw new Error("Brauzering bu suratni kichraytira olmaydi. Boshqa brauzerda urinib ko'r.");
  }

  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
    let width = Math.max(1, Math.round(bitmap.width * scale));
    let height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Suratni tayyorlash uchun canvas ochilmadi.");

    let compressed: Blob | null = null;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      canvas.width = width;
      canvas.height = height;
      context.fillStyle = "#fff";
      context.fillRect(0, 0, width, height);
      context.drawImage(bitmap, 0, 0, width, height);
      const quality = Math.max(0.48, 0.78 - attempt * 0.08);
      compressed = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (!compressed) throw new Error("Suratni JPEG formatiga aylantirib bo'lmadi.");
      if (compressed.size <= MAX_COMPRESSED_IMAGE_BYTES) break;
      width = Math.max(1, Math.round(width * 0.82));
      height = Math.max(1, Math.round(height * 0.82));
    }
    if (!compressed || compressed.size > MAX_COMPRESSED_IMAGE_BYTES) {
      throw new Error("Suratni kerakli hajmgacha kichraytirib bo'lmadi. Boshqa rasm tanla.");
    }

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Kichraytirilgan suratni o'qib bo'lmadi."));
      reader.onload = () => {
        if (typeof reader.result === "string") resolve(reader.result);
        else reject(new Error("Kichraytirilgan surat formati noto'g'ri."));
      };
      reader.readAsDataURL(compressed);
    });
  } finally {
    bitmap.close();
  }
}

const isUnknownList = (value: unknown): value is UnknownMessage[] =>
  Array.isArray(value) && value.every((item) => typeof item === "object" && item !== null
    && "text" in item && typeof item.text === "string" && "time" in item && typeof item.time === "string");

type MittichaChatProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  placement?: "floating" | "page";
  tutorPrompt?: string | null;
  onTutorPromptHandled?: () => void;
  onHomeworkCompletion?: (item: HomeworkItem) => void;
  onTestResult?: (result: TestResult) => void;
  onAutoHomeworkTutor?: (item: HomeworkItem) => void;
};

function todayLabel(date: Date): string {
  return new Intl.DateTimeFormat("uz-UZ", { weekday: "long", day: "numeric", month: "long" }).format(date);
}

function dateDivider(value: string): string {
  const date = new Date(value);
  const today = new Date();
  const yesterday = addDays(today, -1);
  if (getDateKey(date) === getDateKey(today)) return "Bugun";
  if (getDateKey(date) === getDateKey(yesterday)) return "Kecha";
  return new Intl.DateTimeFormat("uz-UZ", { day: "numeric", month: "long" }).format(date);
}

function greetingFor(name: string, date: Date, daysOff: DayOff[], bellMessage: string): string {
  const hour = date.getHours();
  const greeting = hour < 11 ? "Xayrli tong" : hour < 18 ? "Xayrli kun" : "Xayrli kech";
  const dayIndex = getSchoolDayIndex(date);
  const hasAlgebra = dayIndex >= 0 && !daysOff.some((day) => day.date === getDateKey(date))
    && week[dayIndex].fanlar.includes("Algebra");
  const dailyPack = hasAlgebra ? " Bugun Algebra bor! Chiziqli tenglamalar bo'yicha 10 ta test va 1 ta vazifa tayyor. Boshlaymizmi?" : "";
  return `${greeting}, ${name || "do'stim"}! Men Mittichaman 🐣. Men internet ishlatmayman — darslar va savollar banki qurilmangda ishlaydi.${dailyPack}\n\n${bellMessage}\n\nNima qilamiz?`;
}

function randomReply(choices: string[], lastReply?: string): string {
  const available = choices.filter((item) => item !== lastReply);
  const selection = available.length ? available : choices;
  return selection[Math.floor(Math.random() * selection.length)] ?? "";
}

function isWritingSubject(value: string): value is WritingSubject {
  return writingSubjects.some((subject) => subject === value);
}

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | undefined {
  if (typeof window === "undefined") return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

// Mitticha chat, kichik testlar va yo'naltiruvchi uy vazifalarini brauzerning o'zida bajaradi.
export function MittichaChat({
  isOpen, onOpenChange, placement = "floating", tutorPrompt = null,
  onTutorPromptHandled, onHomeworkCompletion, onTestResult, onAutoHomeworkTutor,
}: MittichaChatProps) {
  const navigate = useNavigate();
  const { messages, addMessage, removeMessage, clearHistory } = useChatHistory();
  const [homework, updateHomework] = useHomeworkStorage();
  const [clock, setClock] = useState(() => new Date());
  const [input, setInput] = useState("");
  const [voiceInputSupported] = useState(() => Boolean(getSpeechRecognitionConstructor()));
  const [voiceOutputSupported] = useState(() => typeof window !== "undefined"
    && typeof window.speechSynthesis !== "undefined"
    && typeof SpeechSynthesisUtterance !== "undefined");
  const [voiceRepliesEnabled, setVoiceRepliesEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("");
  const [writingText, setWritingText] = useState("");
  const [writingLoading, setWritingLoading] = useState(false);
  const [homeworkImageDataUrl, setHomeworkImageDataUrl] = useState<string | null>(null);
  const [imageStatus, setImageStatus] = useState("");
  const [imageProcessing, setImageProcessing] = useState(false);
  const [imageSubmitting, setImageSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [flow, setFlow] = useState<Flow>("menu");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedPack, setSelectedPack] = useState<StudyPack | null>(null);
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const [hintCount, setHintCount] = useState(0);
  const [solution, setSolution] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [taskFinished, setTaskFinished] = useState(false);
  const [profile] = usePersistentState("kundalik-profile", (value): value is { name: string } =>
    typeof value === "object" && value !== null && "name" in value && typeof value.name === "string", { name: "" });
  const [calendarSettings] = usePersistentState<CalendarSettings>("kundalik-calendar-settings", isCalendarSettings, defaultCalendarSettings);
  const [daysOff] = usePersistentState<DayOff[]>("kundalik-days-off", isDayOffList, []);
  const [periods, updatePeriods] = usePersistentState<ClassPeriod[]>("kundalik-periods", isClassPeriodList, defaultPeriods);
  const [settings] = usePersistentState("kundalik-mitticha-settings", isMittichaSettings, defaultMittichaSettings);
  const [bellReminders] = usePersistentState("kundalik-bell-reminders", isBellReminderSettings, defaultBellReminderSettings);
  const [testResults, updateTestResults] = usePersistentState<TestResult[]>("kundalik-test-results", isTestResults, []);
  const [weakTopics, updateWeakTopics] = usePersistentState<WeakTopic[]>("kundalik-weak-topics", isWeakTopicList, []);
  const [unknownMessages, updateUnknownMessages] = usePersistentState<UnknownMessage[]>("kundalik-unknown-messages", isUnknownList, []);
  const [autoHomeworkNotice] = usePersistentState(
    "kundalik-auto-homework-notice", isAutoHomeworkNotice, null,
  );
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [animateResult, setAnimateResult] = useState(false);
  const [studyPlan, setStudyPlan] = useState<StudyPlanItem[]>([]);
  const [studyPlanLoading, setStudyPlanLoading] = useState(false);
  const [examSeconds, setExamSeconds] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const homeworkImageInputRef = useRef<HTMLInputElement>(null);
  const speechRecognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const handledTutorPrompt = useRef<string | null>(null);
  const lastReplyByTopic = useRef(new Map<string, string>());

  const today = clock;
  const todayKey = getDateKey(today);
  const lessonCounts = countLessonsBySubject(
    week, calendarSettings.schoolYearStart, new Date(`${todayKey}T12:00:00`), daysOff.map((item) => item.date),
  );
  const dueTopics = getDueWeakTopics(weakTopics, todayKey);
  const currentBellStatus = getCurrentStatus(today, periods, daysOff);
  const pendingHomeworkCount = homework.filter((item) => !item.completed).length;
  const bellStatusMessage = formatBellStatusMessage(
    currentBellStatus, pendingHomeworkCount, bellReminders.leadMinutes, today,
  );
  const shortBellStatus = formatBellStatusMessage(
    currentBellStatus, pendingHomeworkCount, bellReminders.leadMinutes, today, true,
  );
  const availableSubjects = [...new Set(allPacks.map((item) => item.fan))];
  const visibleMessages = useMemo(() => {
    const filtered = search.trim()
      ? messages.filter((item) => item.matn.toLocaleLowerCase("uz").includes(search.toLocaleLowerCase("uz")))
      : messages;
    return filtered;
  }, [messages, search]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, quiz, isOpen]);

  // Avtomatik vazifa xabarini chat tarixida ham bir marta ko'rsatadi.
  useEffect(() => {
    if (!autoHomeworkNotice) return;
    if (messages.some((message) => message.matn === autoHomeworkNotice.message)) return;
    addMessage("mitticha", autoHomeworkNotice.message);
  }, [addMessage, autoHomeworkNotice, messages]);

  function viewAutoHomework() {
    onOpenChange(false);
    navigate("/homework");
  }

  function tutorAutoHomework() {
    const item = homework.find((entry) => entry.source === "mitticha" && entry.dueDate === autoHomeworkNotice?.targetDate);
    if (item && onAutoHomeworkTutor) {
      onAutoHomeworkTutor(item);
      return;
    }
    onOpenChange(false);
    navigate("/homework");
  }

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isLegacyDefaultPeriods(periods)) updatePeriods(() => defaultPeriods);
  }, [periods, updatePeriods]);

  useEffect(() => () => {
    speechRecognitionRef.current?.stop();
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  // Muddati kelgan mavzular bo'lsa, chat ochilganda o'quvchiga bir marta eslatadi.
  useEffect(() => {
    if (!isOpen || dueTopics.length === 0) return;
    const alreadyReminded = messages.some((message) =>
      message.kim === "mitticha"
      && message.matn.includes("Zaif mavzularni takrorlash vaqti keldi")
      && getDateKey(new Date(message.vaqt)) === todayKey,
    );
    if (alreadyReminded) return;
    const hour = new Date().getHours();
    const greeting = hour < 11 ? "Xayrli tong" : hour < 18 ? "Xayrli kun" : "Xayrli kech";
    const name = profile.name.trim() || "do'stim";
    addMessage("mitticha", `${greeting}, ${name}! Bugun zaif mavzularni takrorlash vaqti keldi: ${dueTopics.map((item) => item.topic).join(", ")}. Menyudagi **Xatolar ustida ishlash** tugmasini bosib boshlaymiz!`);
  }, [addMessage, dueTopics, isOpen, messages, profile.name, todayKey]);

  // Imtihon davomida taymerni yangilab, vaqt tugaganda natijani avtomatik chiqaradi.
  useEffect(() => {
    if (!quiz?.examMode || quiz.stage === "done") return;
    const timerId = window.setInterval(() => {
      setExamSeconds((remaining) => {
        if (remaining === null) return null;
        if (remaining > 1) return remaining - 1;

        // Taymer tugaganda javoblangan savollar bo'yicha natijani saqlab, imtihonni yakunlaydi.
        window.setTimeout(() => {
          const finished: QuizState = { ...quiz, stage: "done" };
          const weakTopicId = quiz.weakTopicId;
          const result: TestResult = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            subject: quiz.pack.fan,
            topic: quiz.pack.mavzu,
            score: quiz.score,
            total: quiz.questions.length,
            wrongIds: quiz.wrongIds,
          };
          if (!quiz.review) {
            updateTestResults((current) => [...current, result].slice(-100));
            onTestResult?.(result);
          }
          if (quiz.wrongIds.length > 0) {
            updateWeakTopics((current) => recordWeakTopicFailure(current, quiz.pack.fan, quiz.pack.mavzu, quiz.wrongIds));
          } else if (weakTopicId) {
            updateWeakTopics((current) => recordWeakTopicSuccess(current, weakTopicId));
          }
          setQuiz(finished);
          addMessage("mitticha", `⏱️ Vaqt tugadi! Imtihon natijang: **${quiz.score}/${quiz.questions.length}**. ${quiz.wrongIds.length ? `Xato javoblar: ${quiz.wrongIds.length} ta. ${quiz.pack.mavzu} mavzusini takrorlashni tavsiya qilaman.` : "Javoblaring to'g'ri chiqdi — barakalla!"}`);
        }, 0);
        return 0;
      });
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [addMessage, onTestResult, quiz, updateTestResults, updateWeakTopics]);

  useEffect(() => {
    if (!tutorPrompt || !isOpen || handledTutorPrompt.current === tutorPrompt) return;
    const timeout = window.setTimeout(() => {
      if (handledTutorPrompt.current === tutorPrompt) return;
      handledTutorPrompt.current = tutorPrompt;
      addMessage("user", `Menga shu uy vazifasida yordam ber: ${tutorPrompt}`);
      addMessage("mitticha", "Albatta! Avval savolni o'z so'zing bilan tushunib olaylik. Qaysi ma'lumotlar berilgan va nimani topish kerak? Shundan keyin birinchi ishorani beraman.");
      onTutorPromptHandled?.();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [addMessage, isOpen, onTutorPromptHandled, tutorPrompt]);

  function readAloud(text: string) {
    if (!voiceOutputSupported) return;
    const plainText = text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[*_`#]/g, "")
      .replace(/\$\$?([\s\S]+?)\$\$?/g, "$1")
      .trim();
    if (!plainText) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = "uz-UZ";
    utterance.onerror = () => setVoiceStatus("Ovozli javobni o'qib bo'lmadi.");
    window.speechSynthesis.speak(utterance);
  }

  function say(text: string) {
    addMessage("mitticha", text);
    if (voiceRepliesEnabled) readAloud(text);
  }

  function toggleVoiceInput() {
    if (isListening) {
      speechRecognitionRef.current?.stop();
      return;
    }
    const SpeechRecognition = getSpeechRecognitionConstructor();
    if (!SpeechRecognition) {
      setVoiceStatus("Brauzeringiz ovozli kiritishni qo'llab-quvvatlamaydi.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "uz-UZ";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcripts: string[] = [];
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result?.isFinal && result[0]?.transcript) transcripts.push(result[0].transcript);
      }
      const transcript = transcripts.join(" ").trim();
      if (transcript) {
        setInput((current) => [current, transcript].filter(Boolean).join(" "));
        setVoiceStatus("Ovoz qabul qilindi. Matnni tekshirib, yubor.");
      } else {
        setVoiceStatus("Ovoz aniqlanmadi. Yana urinib ko'r.");
      }
    };
    recognition.onerror = (event) => {
      const errors: Record<string, string> = {
        "not-allowed": "Mikrofon uchun ruxsat berilmadi. Brauzer sozlamasini tekshir.",
        "service-not-allowed": "Brauzer ovozli xizmatga ruxsat bermadi.",
        "audio-capture": "Mikrofon topilmadi yoki ishlamayapti.",
        "no-speech": "Ovoz aniqlanmadi. Yana urinib ko'r.",
      };
      setVoiceStatus(errors[event.error] ?? "Ovozli kiritishda xatolik yuz berdi.");
    };
    recognition.onend = () => {
      speechRecognitionRef.current = null;
      setIsListening(false);
      setVoiceStatus((current) => current === "Tinglayapman…" ? "Tinglash tugadi." : current);
    };
    speechRecognitionRef.current = recognition;
    setVoiceStatus("Tinglayapman…");
    setIsListening(true);
    recognition.start();
  }

  function toggleVoiceReplies() {
    const enabled = !voiceRepliesEnabled;
    setVoiceRepliesEnabled(enabled);
    setVoiceStatus(enabled ? "Mitticha javoblarini ovoz chiqarib o'qiydi." : "");
    if (!enabled && voiceOutputSupported) window.speechSynthesis.cancel();
  }

  function closeChat() {
    speechRecognitionRef.current?.stop();
    speechRecognitionRef.current = null;
    setIsListening(false);
    setVoiceRepliesEnabled(false);
    if (voiceOutputSupported) window.speechSynthesis.cancel();
    onOpenChange(false);
  }

  function toggleChat() {
    if (isOpen) closeChat();
    else onOpenChange(true);
  }

  function speakSmallTalk(message: string): boolean {
    const matched = matchSmallTalk(message);
    if (matched.length === 0) return false;
    const name = profile.name.trim() || "do'stim";
    for (const topic of matched) {
      if (topic.nomi === "Jadval") {
        const normalized = normalizeText(message);
        const isTomorrow = /ertaga|ertangi/.test(normalized);
        const isNextLesson = /keyingi dars/.test(normalized);
        let date = isTomorrow ? addDays(today, 1) : today;
        const dayIndex = getSchoolDayIndex(date);
        const dayOff = daysOff.find((item) => item.date === getDateKey(date));
        let subjects = dayOff ? [] : dayIndex >= 0 ? week[dayIndex].fanlar : [];
        if (isNextLesson) {
          const nowMinute = today.getHours() * 60 + today.getMinutes();
          const todayIndex = getSchoolDayIndex(today);
          const lessonIndex = todayIndex >= 0 && !daysOff.some((item) => item.date === todayKey)
            ? periods.slice(0, week[todayIndex].fanlar.length).findIndex((period) => period.end > nowMinute)
            : -1;
          if (lessonIndex >= 0) {
            say(nowMinute >= periods[lessonIndex].start
              ? `Hozirgi yoki navbatdagi dars: ${week[todayIndex].fanlar[lessonIndex]} (${periods[lessonIndex].start < nowMinute ? "davom etmoqda" : "keyingi dars"}).`
              : `Keyingi dars: ${week[todayIndex].fanlar[lessonIndex]}.`);
            continue;
          }
          for (let offset = 1; offset <= 7; offset += 1) {
            const nextDate = addDays(today, offset);
            const nextIndex = getSchoolDayIndex(nextDate);
            if (nextIndex >= 0 && !daysOff.some((item) => item.date === getDateKey(nextDate))) {
              date = nextDate;
              subjects = week[nextIndex].fanlar;
              break;
            }
          }
          say(subjects.length ? `Keyingi dars ${todayLabel(date)} kuni: ${subjects[0]}.` : "Yaqin kunlarda jadval bo'yicha dars topilmadi.");
          continue;
        }
        const prefix = isTomorrow ? "Ertaga" : "Bugun";
        say(subjects.length
          ? `${prefix} ${subjects.length} ta dars: ${subjects.join(", ")}.`
          : `${prefix} jadval bo'yicha dars yo'q — dam olishni ham rejalashtir!`);
      } else if (topic.nomi === "Vaqt va sana") {
        const clock = new Intl.DateTimeFormat("uz-UZ", { hour: "2-digit", minute: "2-digit" }).format(today);
        const day = new Intl.DateTimeFormat("uz-UZ", { weekday: "long" }).format(today);
        const date = todayLabel(today);
        const reply = randomReply(topic.javoblar);
        say(reply.replaceAll("{ism}", name).replaceAll("{soat}", clock).replaceAll("{sana}", date).replaceAll("{kun}", day));
      } else {
        const reply = randomReply(topic.javoblar, lastReplyByTopic.current.get(topic.nomi));
        lastReplyByTopic.current.set(topic.nomi, reply);
        say(reply.replaceAll("{ism}", name));
      }
    }
    return true;
  }

  function beginFlow(action: string) {
    setSelectedSubject("");
    setSelectedPack(null);
    setQuiz(null);
    setHintCount(0);
    setShowAnswer(false);
    setTaskFinished(false);
    setSolution("");
    setStudyPlan([]);
    setWritingText("");
    setHomeworkImageDataUrl(null);
    setImageStatus("");
    setImageProcessing(false);
    setImageSubmitting(false);
    if (homeworkImageInputRef.current) homeworkImageInputRef.current.value = "";
    if (action === "planner") {
      addMessage("user", "Bugungi rejam");
      void generateStudyPlan();
      return;
    }
    if (action === "exam") setFlow("exam-subject");
    else if (action === "test") setFlow("test-subject");
    else if (action === "homework") setFlow("homework-subject");
    else if (action === "explain") setFlow("explain-subject");
    else if (action === "writing") setFlow("writing-subject");
    else if (action === "image") setFlow("image-upload");
    else if (action === "review") setFlow("review");
  }

  // Ertangi darslar va muddati yaqin vazifalardan kunlik reja so'raydi.
  async function generateStudyPlan() {
    setStudyPlanLoading(true);
    setStudyPlan([]);
    setFlow("menu");
    const tomorrow = addDays(today, 1);
    const tomorrowIndex = getSchoolDayIndex(tomorrow);
    const tomorrowLessons = daysOff.some((day) => day.date === getDateKey(tomorrow)) || tomorrowIndex < 0
      ? [] : week[tomorrowIndex].fanlar;
    const startAfter = new Date(today);
    const startAfterMinute = Math.max(16 * 60, today.getHours() * 60 + today.getMinutes() + 10);
    if (startAfterMinute > 21 * 60) {
      setStudyPlanLoading(false);
      say("Bugun reja tuzish uchun kech bo'ldi. Dam ol, ertaga davom etamiz!");
      return;
    }
    startAfter.setHours(Math.floor(startAfterMinute / 60), startAfterMinute % 60, 0, 0);
    const formatClock = (date: Date) =>
      `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    try {
      const result = await requestStudyPlan({
        todayDate: todayKey,
        tomorrowDate: getDateKey(tomorrow),
        currentTime: formatClock(today),
        startAfter: formatClock(startAfter),
        lessons: tomorrowLessons,
        pendingHomework: homework.filter((item) => !item.completed).slice(0, 20).map((item) => ({
          title: item.title.slice(0, 200),
          subject: item.subject.slice(0, 80),
          dueDate: item.dueDate,
        })),
      });
      setStudyPlan(result);
      say(result.length
        ? "Mana bugungi rejang! Ertangi darslar va muddati yaqin vazifalarni inobatga oldim. Har blokdan keyin dam olishni unutma 🌱"
        : "Bugun uchun reja topilmadi. Vazifalaring bo'lsa, avval ro'yxatga qo'shib ko'r.");
    } catch (error) {
      say(error instanceof Error ? error.message : "Reja tuzishda xatolik yuz berdi. Qayta urinib ko'r.");
    } finally {
      setStudyPlanLoading(false);
    }
  }

  function startQuiz(
    pack: StudyPack,
    questions = pack.testlar,
    isReview = false,
    examMode = false,
    weakTopicId: string | null = null,
  ) {
    if (questions.length === 0) {
      say("Bu mavzu bo'yicha hali xato javoblar saqlanmagan. Avval test ishlab ko'ramizmi?");
      setFlow("menu");
      return;
    }
    setSelectedPack(pack);
    setExamSeconds(examMode ? 10 * 60 : null);
    setQuiz({
      pack, questions, index: 0, score: 0, wrongIds: [], stage: "question",
      lastCorrect: false, hintOpen: false, review: isReview, examMode, weakTopicId,
    });
    setFlow("menu");
    say(examMode
      ? `${pack.fan} — ${pack.mavzu} imtihoni boshlandi! 10 ta savolga 10 daqiqa vaqt. Omad!`
      : `${pack.fan} — ${pack.mavzu}${isReview ? " bo'yicha xatolarni qaytaramiz" : " testi"}. ${questions.length} ta savol, boshladik!`);
  }

  function chooseSubject(subject: string, action: "test" | "exam" | "homework" | "explain" | "writing") {
    setSelectedSubject(subject);
    if (action === "writing") {
      setFlow("writing-editor");
      return;
    }
    const packList = packsForSubject(subject);
    const allTopics = topicsForSubject(subject);
    if (action === "exam") setFlow("exam-topic");
    else if (action === "test") setFlow("test-topic");
    else if (action === "homework") setFlow("homework-topic");
    else setFlow("explain-topic");
    if (packList.length === 0 || allTopics.length === 0) say(`${subject} uchun offline material hali qo'shilmagan. Keyin savollar bankiga qo'shishingiz mumkin.`);
  }

  function selectTopic(topic: string, action: "test" | "exam" | "homework" | "explain") {
    const pack = findPack(selectedSubject, topic);
    if (action === "explain") {
      const text = explanations.find((item) => item.fan === selectedSubject && item.mavzu === topic);
      setFlow("menu");
      say(text ? `### ${text.fan}: ${text.mavzu}\n\n${text.matn}\n\n**Misollar:**\n\n1. ${text.misollar[0]}\n2. ${text.misollar[1]}` : "Bu mavzu uchun tushuntirish hali qo'shilmagan.");
      return;
    }
    if (!pack) {
      say("Bu mavzuning savollar paketi hali qo'shilmagan.");
      setFlow("menu");
      return;
    }
    setSelectedPack(pack);
    if (action === "exam") {
      if (pack.testlar.length < 10) {
        say(`Imtihon uchun bu mavzuda 10 ta savol bo'lishi kerak. Hozir ${pack.testlar.length} ta bor.`);
        setFlow("menu");
        return;
      }
      startQuiz(pack, pack.testlar.slice(0, 10), false, true);
      return;
    }
    if (action === "test") {
      setFlow("menu");
      say(`${pack.fan} / ${pack.mavzu}: savollar soni — ${pack.testlar.length}.`);
      startQuiz(pack);
    } else {
      setFlow("menu");
      setHintCount(0);
      setShowAnswer(false);
      setTaskFinished(false);
      setSolution("");
      say(`${pack.fan} fanidan "${pack.mavzu}" mavzusi uchun bitta uy vazifasi tayyor. Qadam-baqadam urinib ko'r!`);
    }
  }

  function answerQuestion(answerIndex: number) {
    if (!quiz || quiz.stage !== "question") return;
    const question = quiz.questions[quiz.index];
    const correct = answerIndex === question.togri;
    const wrongIds = correct ? quiz.wrongIds : [...quiz.wrongIds, question.id];
    const next = { ...quiz, score: quiz.score + Number(correct), wrongIds, stage: "feedback" as const, lastCorrect: correct, hintOpen: true };
    setQuiz(next);
    setAnimateResult(true);
    window.setTimeout(() => setAnimateResult(false), 500);
    addMessage("user", `Javobim: ${question.variantlar[answerIndex]}`);
    addMessage("mitticha", `${correct ? "✅ To'g'ri! Barakalla!" : "❌ Bu safar noto'g'ri."}\n\n**Ishora:** ${question.ishora}\n\n**Izoh:** ${question.izoh}`);
  }

  function advanceQuiz() {
    if (!quiz || quiz.stage !== "feedback") return;
    if (quiz.index + 1 >= quiz.questions.length) {
      const result: TestResult = {
        id: crypto.randomUUID(), date: new Date().toISOString(), subject: quiz.pack.fan,
        topic: quiz.pack.mavzu, score: quiz.score, total: quiz.questions.length, wrongIds: quiz.wrongIds,
      };
      const weakTopicId = quiz.weakTopicId;
      if (!quiz.review) {
        updateTestResults((current) => [...current, result].slice(-100));
        onTestResult?.(result);
      }
      if (quiz.wrongIds.length > 0) {
        updateWeakTopics((current) => recordWeakTopicFailure(current, quiz.pack.fan, quiz.pack.mavzu, quiz.wrongIds));
      } else if (weakTopicId) {
        updateWeakTopics((current) => recordWeakTopicSuccess(current, weakTopicId));
      }
      setExamSeconds(null);
      setQuiz({ ...quiz, stage: "done" });
      say(`Test tugadi! Natija: **${quiz.score}/${quiz.questions.length}** (${Math.round(quiz.score / quiz.questions.length * 100)}%). ${quiz.wrongIds.length ? `Xato savollar: ${quiz.wrongIds.length} ta. Ularni qayta ko'rib chiqamizmi?` : "Hammasi to'g'ri — ajoyib ish!"}`);
      return;
    }
    setQuiz({ ...quiz, index: quiz.index + 1, stage: "question", hintOpen: false });
  }

  function finishHomework(correct: boolean) {
    if (!selectedPack) return;
    const task = selectedPack.uyVazifa;
    const id = `offline-${task.id}-${todayKey}`;
    const newTask: HomeworkItem = {
      id, title: task.matn, subject: selectedPack.fan, dueDate: todayKey,
      completed: correct, createdAt: new Date().toISOString(),
      difficulty: task.qiyinlik === "o'rta" ? "orta" : task.qiyinlik,
      estimatedMinutes: task.taxminiyVaqt,
    };
    if (onHomeworkCompletion) {
      onHomeworkCompletion(newTask);
    } else {
      updateHomework((current) => current.some((item) => item.id === id)
        ? current.map((item) => item.id === id ? { ...item, completed: correct } : item)
        : [newTask, ...current]);
    }
    if (!correct) {
      updateWeakTopics((current) => recordWeakTopicFailure(current, selectedPack.fan, selectedPack.mavzu));
    }
    setTaskFinished(true);
    say(correct ? "Zo'r! Vazifa bajarildi deb belgiladim. O'zingga ishonganing uchun rahmat! 🎉" : "Hechqisi yo'q — vazifa ro'yxatingda bajarilmagan holda saqlandi. Ishoralarni ko'rib, yana urinib ko'r.");
  }

  function autoTopic(subject: string): string | undefined {
    const manual = settings.manualTopics[subject];
    const subjectTopics = topicsForSubject(subject);
    if (manual && subjectTopics.includes(manual)) return manual;
    const count = lessonCounts.find((item) => item.subject === subject)?.total ?? 0;
    const perTopic = Math.max(1, settings.lessonsPerTopic);
    return subjectTopics[Math.min(Math.floor(count / perTopic), Math.max(subjectTopics.length - 1, 0))];
  }

  function saveUnknown(message: string) {
    const now = new Date().toISOString();
    updateUnknownMessages((current) => [...current, { text: message, time: now }].slice(-100));
  }

  function translateSmallTalk(message: string): boolean {
    const normalized = normalizeText(message);
    const dictionaryCommand = /^(tarjima|translate)\s*:/i.test(message);
    const targetEntry = normalized.match(/^(.*?)\s+(o'zbekchada|inglizchada|ruschada)\s+nima$/);
    if (!dictionaryCommand && !targetEntry) return false;

    const query = dictionaryCommand
      ? message.replace(/^(tarjima|translate)\s*:/i, "").trim()
      : targetEntry?.[1]?.trim() ?? "";
    const target: TranslatorLanguage | undefined = targetEntry?.[2] === "o'zbekchada"
      ? "uz" : targetEntry?.[2] === "inglizchada" ? "en" : targetEntry?.[2] === "ruschada" ? "ru" : undefined;
    const matches = findDictionaryEntries(query);
    const item = matches[0];
    if (!item) {
      say(`"${query}" offline lug'atda topilmadi. Uni **Tarjimon** sahifasida onlayn tarjima qilib ko'rishing mumkin.`);
      return true;
    }

    const sourceLanguage = (["uz", "en", "ru"] as const).find((language) =>
      normalizeText(item[language]) === normalizeText(query),
    );
    const languages: TranslatorLanguage[] = target ? [target]
      : (["uz", "en", "ru"] as const).filter((language) => language !== sourceLanguage);
    const lines = languages.map((language) => `**${language.toUpperCase()}:** ${item[language]}`);
    say(`**${query}** lug'atdan topildi:\n\n${lines.join("\n\n")}\n\n_${item.fan} · ${item.misol}_`);
    return true;
  }

  function sendUserText(text: string) {
    const clean = text.trim();
    if (!clean) return;
    addMessage("user", clean);
    setInput("");

    if (translateSmallTalk(clean)) return;
    const normalized = normalizeText(clean);
    if (/(hozir.*qaysi.*(dars|fan)|keyingi.*dars.*(nima|qaysi)|dars.*qachon.*tug|dars.*tugashiga qancha)/.test(normalized)) {
      say(bellStatusMessage);
      return;
    }
    if (speakSmallTalk(clean)) return;

    if (/rasm.*vazifa|vazifa.*rasm|rasmdan masala/.test(normalized)) {
      say("Masala suratini tanlash uchun **Rasmdan vazifa** tugmasini bos.");
      beginFlow("image");
      return;
    }
    if (/insho|yozma ish/.test(normalized)) { beginFlow("writing"); return; }
    if (/imtihon/.test(normalized)) { beginFlow("exam"); return; }
    if (/\b(test|viktorina|quiz)\b/.test(normalized)) { beginFlow("test"); return; }
    if (/bugungi reja|kunlik reja/.test(normalized)) { void generateStudyPlan(); return; }
    if (/uy vazifa|topshiriq ber/.test(normalized)) { beginFlow("homework"); return; }
    if (/mavzu.*tushunt|tushuntir/.test(normalized)) { beginFlow("explain"); return; }
    if (/xato|noto'g'ri|takror/.test(normalized)) { beginFlow("review"); return; }
    if (/jadval|darslar/.test(normalized)) {
      const index = getSchoolDayIndex(today);
      const lessons = index >= 0 ? week[index].fanlar : [];
      say(lessons.length ? `Bugun ${lessons.length} ta dars bor: ${lessons.join(", ")}.` : "Bugun jadval bo'yicha dars yo'q.");
      return;
    }
    saveUnknown(clean);
    say(respondOffline(clean));
    setFlow("menu");
  }

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendUserText(input);
  }

  async function submitWriting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = writingText.trim();
    if (!isWritingSubject(selectedSubject)) {
      say("Yozma ish uchun berilgan fanlardan birini tanla.");
      setFlow("writing-subject");
      return;
    }
    if (text.length < 30 || text.length > 3000) {
      say("Tekshiruv uchun matn 30–3000 belgi orasida bo'lishi kerak.");
      return;
    }

    setWritingLoading(true);
    addMessage("user", `${selectedSubject} yozma ishi:\n\n${text}`);
    try {
      const review = await requestWritingReview(selectedSubject, text);
      say(review);
      setWritingText("");
    } catch (error) {
      say(error instanceof Error ? error.message : "Yozma ishni tekshirishda xatolik yuz berdi.");
    } finally {
      setWritingLoading(false);
    }
  }

  async function selectHomeworkImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setHomeworkImageDataUrl(null);
    setImageStatus("Surat brauzerda kichraytirilmoqda…");
    setImageProcessing(true);
    try {
      const imageDataUrl = await compressHomeworkImage(file);
      setHomeworkImageDataUrl(imageDataUrl);
      const approximateKilobytes = Math.round((imageDataUrl.length * 3) / 4 / 1024);
      setImageStatus(`Surat tayyor: taxminan ${approximateKilobytes} KB. Rasm serverga yuborilishidan oldin kichraytirildi.`);
    } catch (error) {
      setImageStatus(error instanceof Error ? error.message : "Suratni tayyorlab bo'lmadi. Boshqa rasm tanlab ko'r.");
    } finally {
      setImageProcessing(false);
    }
  }

  async function submitHomeworkImage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!homeworkImageDataUrl) {
      setImageStatus("Avval daftar yoki kitob suratini tanla.");
      return;
    }
    setImageSubmitting(true);
    setImageStatus("Mitticha suratdagi topshiriqni o'qiyapti…");
    try {
      const explanation = await requestHomeworkImage(homeworkImageDataUrl);
      addMessage("user", "Suratdagi topshiriqni tushuntirish so'raldi.");
      say(explanation);
      setHomeworkImageDataUrl(null);
      setImageStatus("");
      if (homeworkImageInputRef.current) homeworkImageInputRef.current.value = "";
      setFlow("menu");
    } catch (error) {
      setImageStatus(error instanceof Error ? error.message : "Suratdagi vazifani o'qib bo'lmadi. Qayta urinib ko'r.");
    } finally {
      setImageSubmitting(false);
    }
  }

  function clearConversation() {
    if (!window.confirm("Hamma suhbat o'chadi. Davom etamizmi?")) return;
    clearHistory();
    setShowClearConfirm(false);
    setFlow("menu");
    setQuiz(null);
  }

  function exportHistory() {
    const text = messages.map((item) => {
      const time = new Intl.DateTimeFormat("uz-UZ", { dateStyle: "short", timeStyle: "short" }).format(new Date(item.vaqt));
      return `[${time}] ${item.kim === "user" ? "Men" : "Mitticha"}: ${item.matn}`;
    }).join("\n\n");
    const blob = new Blob([text || "Suhbat tarixi bo'sh."], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "mitticha-suhbat.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function renderWelcome() {
    const welcome = greetingFor(profile.name.trim(), today, daysOff, bellStatusMessage);
    return (
      <div className="chat-welcome offline-welcome">
        <span className="chat-welcome-sparkle"><span>🐣</span></span>
        <h3>{welcome.split("!")[0]}!</h3>
        <p>{welcome.slice(welcome.indexOf("!") + 1)}</p>
        {dueTopics.length > 0 && (
          <p className="weak-topic-reminder">
            Bugun qaytarish vaqti kelgan mavzular: {dueTopics.map((item) => item.topic).join(", ")}.
            <button type="button" onClick={() => beginFlow("review")}>Hozir takrorlayman</button>
          </p>
        )}
        <div className="offline-welcome-actions">
          {mainButtons.map(({ label, icon: Icon, action }) => (
            <button type="button" key={action} disabled={(action === "planner" && studyPlanLoading) || imageProcessing || imageSubmitting} onClick={() => beginFlow(action)}><Icon size={14} /> {label}</button>
          ))}
        </div>
      </div>
    );
  }

  function renderFlowActions() {
    if (flow === "menu") return null;
    if (flow === "writing-editor") {
      return (
        <form className="writing-review-form" onSubmit={submitWriting}>
          <b>{selectedSubject} · yozma ish</b>
          <p>Matningni o'zing yoz yoki shu yerga joyla. Mitticha uni to'liq qayta yozmaydi, xato va yaxshilash yo'llarini ko'rsatadi.</p>
          <label htmlFor="mitticha-writing-text">Tekshiriladigan matn</label>
          <textarea
            id="mitticha-writing-text"
            value={writingText}
            maxLength={3000}
            onChange={(event) => setWritingText(event.target.value)}
            placeholder="Yozma ishingni shu yerga yoz..."
          />
          <div className="writing-review-form-footer">
            <small>{writingText.length}/3000 · kamida 30 belgi</small>
            <button type="submit" disabled={writingLoading || writingText.trim().length < 30}>
              {writingLoading ? "Tekshirilmoqda..." : "Tahlil qilish"}
            </button>
          </div>
          {writingLoading && <span className="writing-review-loading" role="status">Mitticha grammatikani, uslub va tuzilishni ko'rib chiqyapti…</span>}
          <button className="choice-back" type="button" disabled={writingLoading} onClick={() => setFlow("writing-subject")}>Boshqa fan tanlash</button>
        </form>
      );
    }
    if (flow === "image-upload") {
      return (
        <form className="image-homework-form" onSubmit={submitHomeworkImage}>
          <b>Masalani suratdan o'qib ko'ramiz 📷</b>
          <p>Daftar yoki kitobdagi topshiriqni tanla. Mitticha masalani o'qib, yechishni boshlashga yo'naltiradi.</p>
          <label htmlFor="mitticha-homework-image">Surat (JPG, PNG yoki WebP)</label>
          <input
            ref={homeworkImageInputRef}
            id="mitticha-homework-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={imageProcessing || imageSubmitting}
            onChange={(event) => void selectHomeworkImage(event)}
          />
          {homeworkImageDataUrl && (
            <div className="image-homework-preview">
              <img src={homeworkImageDataUrl} alt="Kichraytirilgan masala surati" />
              <button
                type="button"
                disabled={imageSubmitting}
                onClick={() => {
                  setHomeworkImageDataUrl(null);
                  setImageStatus("");
                  if (homeworkImageInputRef.current) homeworkImageInputRef.current.value = "";
                }}
                aria-label="Tanlangan suratni olib tashlash"
                title="Suratni olib tashlash"
              >
                <X size={14} />
              </button>
            </div>
          )}
          {imageStatus && <span className="image-homework-status" role="status">{imageStatus}</span>}
          <div className="image-homework-footer">
            <small>Asl rasm 8 MB gacha · yuborishdan oldin 1280 px va 700 KB gacha kichraytiriladi.</small>
            <button type="submit" disabled={!homeworkImageDataUrl || imageProcessing || imageSubmitting}>
              {imageProcessing ? "Tayyorlanmoqda…" : imageSubmitting ? "O'qilyapti…" : "Masalani o'qish"}
            </button>
          </div>
          <button className="choice-back" type="button" disabled={imageProcessing || imageSubmitting} onClick={() => setFlow("menu")}>Menyuga qaytish</button>
        </form>
      );
    }
    const options = flow === "writing-subject"
      ? writingSubjects
      : flow === "test-subject" || flow === "exam-subject" || flow === "homework-subject" || flow === "explain-subject"
      ? availableSubjects
      : flow === "test-topic" || flow === "exam-topic" || flow === "homework-topic" || flow === "explain-topic"
        ? topicsForSubject(selectedSubject)
        : [];
    const action = flow.startsWith("writing") ? "writing" : flow.startsWith("exam") ? "exam" : flow.startsWith("test") ? "test" : flow.startsWith("homework") ? "homework" : "explain";
    const label = flow.endsWith("subject") ? "Fan tanlang" : flow.endsWith("topic") ? "Mavzuni tanlang" : "Amalni tanlang";
    if (flow === "review") {
      const due = getDueWeakTopics(weakTopics, todayKey);
      const errorPacks = testResults.map((result) => ({
        result,
        pack: findPack(result.subject, result.topic),
      })).filter((entry) => entry.pack && entry.result.wrongIds.length > 0);
      return (
        <div className="mitticha-choice-panel">
          <b>Takrorlash vaqti kelgan zaif mavzular</b>
          {due.length ? due.map((item) => {
            const pack = findPack(item.subject, item.topic);
            if (!pack) return null;
            const savedQuestions = pack.testlar.filter((question) => item.questionIds.includes(question.id));
            const questions = savedQuestions.length ? savedQuestions : pack.testlar;
            return (
              <button type="button" key={item.id} onClick={() => startQuiz(pack, questions, true, false, item.id)}>
                {item.subject} · {item.topic} · {item.reviewStep}/3 takror
              </button>
            );
          }) : <p>Bugun takrorlash muddati kelgan mavzu yo'q.</p>}
          <b className="weak-review-history-title">Oldingi test xatolari</b>
          {errorPacks.length ? errorPacks.map(({ result, pack }) => pack && (
              <button type="button" key={result.id} onClick={() => startQuiz(pack, pack.testlar.filter((item) => result.wrongIds.includes(item.id)), true)}>
              {result.subject} · {result.topic} · {result.wrongIds.length} ta xato
            </button>
          )) : <p>Hozircha saqlangan test xatolari yo'q. Avval test ishlab ko'r.</p>}
          <button type="button" className="choice-back" onClick={() => setFlow("menu")}>Menyuga qaytish</button>
        </div>
      );
    }
    return (
      <div className="mitticha-choice-panel">
        <b>{label}</b>
        <div className="mitticha-choice-grid">
          {options.map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => {
                if (flow.endsWith("subject")) {
                  chooseSubject(option, action);
                  return;
                }
                if (action === "writing") {
                  say("Yozma ish uchun fan tanlash oynasidan boshlaylik.");
                  setFlow("writing-subject");
                  return;
                }
                selectTopic(option, action);
              }}
            >{option}{flow.endsWith("topic") && autoTopic(selectedSubject) === option && <small>Tavsiya</small>}<ChevronRight size={13} /></button>
          ))}
        </div>
        {flow.endsWith("topic") && selectedSubject && (
          <p className="auto-topic-note">{flow.startsWith("exam") ? "Imtihonda 10 ta savol va 10 daqiqa vaqt bo'ladi. " : ""}Darslar soniga ko'ra tavsiya: <b>{autoTopic(selectedSubject) ?? "mavzu belgilanmagan"}</b>. Boshqa mavzuni ham tanlashing mumkin.</p>
        )}
        <button type="button" className="choice-back" onClick={() => setFlow("menu")}>Menyuga qaytish</button>
      </div>
    );
  }

  function renderQuiz() {
    if (!quiz) return null;
    if (quiz.stage === "done") {
      const percent = Math.round(quiz.score / quiz.questions.length * 100);
      return (
        <motion.div className="offline-result-card" initial={{ scale: .94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <b>🏆 {quiz.examMode ? "Imtihon natijasi" : "Natija"}: {quiz.score}/{quiz.questions.length} · {percent}%</b>
          <p>{quiz.examMode
            ? quiz.wrongIds.length
              ? `${quiz.wrongIds.length} ta xato. Takrorlash tavsiyasi: ${quiz.pack.mavzu}.`
              : `Barcha javoblar to'g'ri — ${quiz.pack.mavzu} mavzusini yaxshi o'zlashtirgansan!`
            : quiz.wrongIds.length
              ? `${quiz.wrongIds.length} ta savolni qayta ko'rib chiqishingiz mumkin.`
              : "Ajoyib! Barcha javoblar to'g'ri."}</p>
          {quiz.wrongIds.length > 0 && (
            <ol className="offline-wrong-answers">
              {quiz.questions.filter((item) => quiz.wrongIds.includes(item.id)).map((item) => (
                <li key={item.id}><b>{item.savol}</b><span>To'g'ri javob: {item.variantlar[item.togri]}</span></li>
              ))}
            </ol>
          )}
          {quiz.wrongIds.length > 0 && <button type="button" onClick={() => startQuiz(quiz.pack, quiz.questions.filter((item) => quiz.wrongIds.includes(item.id)), true)}>Xatolarni qayta ishlash</button>}
          <button type="button" onClick={() => { setQuiz(null); setFlow("menu"); }}>Menyuga qaytish</button>
        </motion.div>
      );
    }
    const question = quiz.questions[quiz.index];
    return (
      <motion.div
        className={`offline-question-card ${quiz.stage === "feedback" ? quiz.lastCorrect ? "answer-correct" : "answer-wrong" : ""} ${animateResult ? "answer-pop" : ""}`}
        key={`${quiz.pack.fan}-${question.id}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="offline-question-meta">
          <span>{quiz.pack.fan} · {quiz.pack.mavzu}</span>
          <b>{quiz.examMode && examSeconds !== null && <span className={`exam-timer ${examSeconds <= 60 ? "exam-timer-warning" : ""}`} role="timer">⏱ {Math.floor(examSeconds / 60)}:{String(examSeconds % 60).padStart(2, "0")}</span>}{quiz.index + 1}/{quiz.questions.length}</b>
        </div>
        <div className="offline-progress"><span style={{ width: `${(quiz.index + 1) / quiz.questions.length * 100}%` }} /></div>
        <div className="offline-question-text"><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{question.savol}</ReactMarkdown></div>
        {quiz.stage === "question" && (
          <>
            <div className="offline-options">
              {question.variantlar.map((option, index) => <button type="button" key={option} onClick={() => answerQuestion(index)}><span>{String.fromCharCode(65 + index)}</span>{option}</button>)}
            </div>
            <button type="button" className="offline-hint-button" onClick={() => setQuiz({ ...quiz, hintOpen: !quiz.hintOpen })}>💡 Ishora</button>
            {quiz.hintOpen && <p className="offline-hint-text">{question.ishora}</p>}
          </>
        )}
        {quiz.stage === "feedback" && (
          <div className={`offline-feedback ${quiz.lastCorrect ? "is-correct" : "is-wrong"}`}>
            <b>{quiz.lastCorrect ? "To'g'ri javob! ✨" : "Bu safar xato 🙈"}</b>
            <p>{question.izoh}</p>
            <button type="button" onClick={advanceQuiz}>{quiz.index + 1 === quiz.questions.length ? "Natijani ko'rish" : "Keyingi savol"} <ChevronRight size={14} /></button>
          </div>
        )}
      </motion.div>
    );
  }

  function renderHomework() {
    if (!selectedPack) return null;
    const task = selectedPack.uyVazifa;
    return (
      <div className="offline-homework-card">
        <div className="offline-question-meta"><span>{selectedPack.fan} · {selectedPack.mavzu}</span><b><Clock3 size={12} /> {task.taxminiyVaqt} daq.</b></div>
        <div className="offline-question-text"><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{task.matn}</ReactMarkdown></div>
        <label className="offline-solution-field">
          <span>O'z yechimingni yozib ko'r</span>
          <textarea value={solution} maxLength={1200} onChange={(event) => setSolution(event.target.value)} placeholder="Qadamlaringni shu yerga yoz..." />
        </label>
        <div className="offline-homework-actions">
          <button type="button" onClick={() => setHintCount((current) => Math.min(current + 1, task.ishoralar.length))} disabled={hintCount >= task.ishoralar.length}>💡 Ishora ber ({hintCount}/{task.ishoralar.length})</button>
          <button type="button" disabled={hintCount < task.ishoralar.length} onClick={() => setShowAnswer((current) => !current)}>{showAnswer ? "Namunani yashirish" : hintCount < task.ishoralar.length ? "3 ishoradan keyin namuna" : "Namuna yechim"}</button>
        </div>
        {hintCount > 0 && <ol className="offline-hints">{task.ishoralar.slice(0, hintCount).map((hint, index) => <li key={index}>{hint}</li>)}</ol>}
        {showAnswer && <div className="offline-sample-answer"><b>Namuna yechim</b><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{task.namunaYechim}</ReactMarkdown><small>Tekshirish kaliti: {task.tekshirishKaliti}</small></div>}
        {taskFinished ? <p className="offline-finished"><Check size={15} /> Vazifa holati yangilandi.</p> : (
          <div className="offline-self-check">
            <span>O'zingni bahola:</span>
            <button type="button" onClick={() => finishHomework(true)}>To'g'ri chiqdi</button>
            <button type="button" onClick={() => finishHomework(false)}>Xato chiqdi</button>
          </div>
        )}
      </div>
    );
  }

  function renderTimestampSeparator(message: LocalChatMessage, previous?: LocalChatMessage) {
    const separator = !previous || dateDivider(previous.vaqt) !== dateDivider(message.vaqt);
    return separator ? <div className="chat-date-divider"><span>{dateDivider(message.vaqt)}</span></div> : null;
  }

  return (
    <div className={`mitticha-widget ${placement === "page" ? "mitticha-widget-page" : ""}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.section
            className={`chat-panel ${placement === "page" ? "chat-panel-page" : ""}`}
            role="dialog"
            aria-label="Mitticha offline yordamchi"
            initial={{ opacity: 0, y: 16, scale: .96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: .97 }}
            transition={{ duration: .18 }}
          >
            <header className="chat-header">
              <div className="chat-avatar"><span>🐣</span><i /></div>
              <div className="chat-heading"><b>Mitticha · Offline yordam</b><span>Reja, yozma ish va rasm uchun ixtiyoriy AI server</span></div>
              <button type="button" className="chat-close" onClick={closeChat} aria-label="Chatni yopish"><X size={18} /></button>
            </header>
            <div className="offline-chat-tools">
              <label><Search size={13} /><input value={search} maxLength={100} onChange={(event) => setSearch(event.target.value)} placeholder="Suhbatdan qidirish..." /></label>
              <button type="button" onClick={exportHistory} title="Suhbatni matn fayl qilib yuklash"><Download size={14} /></button>
              <button type="button" onClick={() => setShowClearConfirm(true)} title="Suhbatni tozalash"><Eraser size={14} /></button>
            </div>
            {autoHomeworkNotice && autoHomeworkNotice.kind !== "failure" && (
              <section className="auto-homework-chat-notice" aria-label="Mitticha avtomatik vazifalari">
                <p>{autoHomeworkNotice.message}</p>
                <div>
                  <button type="button" onClick={viewAutoHomework}>Ko&apos;rish</button>
                  <button type="button" onClick={tutorAutoHomework}>Mitticha bilan yechish</button>
                </div>
              </section>
            )}
            {showClearConfirm && (
              <div className="offline-confirm"><span>Hamma suhbat o'chadi. Davom etamizmi?</span><button type="button" onClick={clearConversation}>Ha</button><button type="button" onClick={() => setShowClearConfirm(false)}>Bekor qilish</button></div>
            )}
            <div className="chat-messages" role="log" aria-live="polite">
              {messages.length === 0 && !search && renderWelcome()}
              {search && visibleMessages.length === 0 && <p className="offline-no-results">Bu so'z suhbatda topilmadi.</p>}
              {visibleMessages.map((message, index) => (
                <div key={message.id}>
                  {renderTimestampSeparator(message, visibleMessages[index - 1])}
                  <div className={`chat-message chat-${message.kim === "user" ? "user" : "assistant"} offline-message`}>
                    {message.kim === "mitticha" && <span className="message-avatar">🐣</span>}
                    <div className={`chat-bubble ${message.kim === "user" ? "chat-bubble-user" : ""}`}>
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{message.matn}</ReactMarkdown>
                      <time>{new Intl.DateTimeFormat("uz-UZ", { hour: "2-digit", minute: "2-digit" }).format(new Date(message.vaqt))}</time>
                    </div>
                    {message.kim === "mitticha" && voiceOutputSupported && (
                      <button className="chat-speak-message" type="button" onClick={() => readAloud(message.matn)} aria-label="Javobni ovoz chiqarib o'qish" title="Javobni ovoz chiqarib o'qish">
                        <Volume2 size={13} />
                      </button>
                    )}
                    <button className="offline-delete-message" type="button" onClick={() => {
                      if (window.confirm("Shu xabarni o'chiraymi?")) removeMessage(message.id);
                    }} aria-label="Xabarni o'chirish"><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
              {renderFlowActions()}
              {studyPlanLoading && <div className="study-plan-loading" role="status">Mitticha rejangni tuzyapti…</div>}
              {studyPlan.length > 0 && (
                <motion.div className="study-plan-cards" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <b>Bugungi o'qish rejang</b>
                  {studyPlan.map((item, index) => (
                    <div className={`study-plan-card study-plan-${item.kind}`} key={`${item.start}-${index}`}>
                      <time>{item.start}–{item.end}</time>
                      <div>
                        <strong>{item.title}</strong>
                        {item.subject && <span>{item.subject}</span>}
                        {item.reason && <small>{item.reason}</small>}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
              {quiz && renderQuiz()}
              {selectedPack && !quiz && renderHomework()}
              <div ref={endRef} />
            </div>
            <div className="quick-prompts offline-main-actions" aria-label="Mitticha menyusi">
              {mainButtons.map(({ label, icon: Icon, action }) => (
                <button type="button" key={action} disabled={(action === "planner" && studyPlanLoading) || imageProcessing || imageSubmitting} onClick={() => beginFlow(action)}><Icon size={13} />{label}</button>
              ))}
              <Link to="/translator" onClick={() => placement === "floating" && closeChat()}>🌐 Tarjimon</Link>
            </div>
            <form className="chat-input-row" onSubmit={submitMessage}>
              {voiceInputSupported && (
                <button
                  className="voice-control"
                  type="button"
                  onClick={toggleVoiceInput}
                  aria-label={isListening ? "Mikrofonni to'xtatish" : "Ovozli savol berish"}
                  aria-pressed={isListening}
                  title={isListening ? "Tinglashni to'xtatish" : "Ovozli savol berish"}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              )}
              {voiceOutputSupported && (
                <button
                  className="voice-control"
                  type="button"
                  onClick={toggleVoiceReplies}
                  aria-label={voiceRepliesEnabled ? "Ovozli javobni o'chirish" : "Ovozli javobni yoqish"}
                  aria-pressed={voiceRepliesEnabled}
                  title={voiceRepliesEnabled ? "Ovozli javob yoqilgan" : "Ovozli javobni yoqish"}
                >
                  {voiceRepliesEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
              )}
              <input aria-label="Mittichaga xabar yozish" maxLength={1000} placeholder="Salom deb yoz yoki savol ber..." value={input} onChange={(event) => setInput(event.target.value)} />
              <button type="submit" disabled={!input.trim()} aria-label="Xabarni yuborish"><Send size={16} /></button>
            </form>
            {voiceStatus && <p className="voice-status" role="status">{voiceStatus}</p>}
            <p className="chat-safety-note"><Bot size={12} /> Offline savollar banki · Natijalar qurilmangizda saqlanadi · tushunilmagan {unknownMessages.length} ibora</p>
          </motion.section>
        )}
      </AnimatePresence>
      {placement === "floating" && (
        <>
          <AnimatePresence mode="wait">
            {!isOpen && (
              <motion.div
                key={autoHomeworkNotice?.id ?? shortBellStatus}
                className="mitticha-status-bubble"
                initial={{ opacity: 0, x: 7, scale: .97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 7, scale: .97 }}
                transition={{ duration: .2 }}
              >
                <button type="button" className="mitticha-bubble-open" onClick={() => onOpenChange(true)} aria-label={`Mitticha aytadi: ${bellStatusMessage}. Suhbatni ochish`}>
                  <b>Mitticha aytadi</b>
                  <span>{autoHomeworkNotice?.message ?? shortBellStatus}</span>
                </button>
                {autoHomeworkNotice && autoHomeworkNotice.kind !== "failure" && (
                  <div className="mitticha-bubble-actions">
                    <button type="button" onClick={viewAutoHomework}>Ko&apos;rish</button>
                    <button type="button" onClick={tutorAutoHomework}>Mitticha bilan yechish</button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button className="mitticha-launcher" type="button" aria-label={isOpen ? "Mitticha chatini yopish" : "Mitticha bilan suhbatni ochish"} aria-expanded={isOpen} onClick={toggleChat} whileHover={{ scale: 1.06 }} whileTap={{ scale: .94 }}>
            {isOpen ? <X size={23} /> : <span className="launcher-face">🐣</span>}
            {!isOpen && <span className="launcher-sparkle">✦</span>}
          </motion.button>
        </>
      )}
    </div>
  );
}

export function MittichaOfflinePage() {
  const [isOpen, setOpen] = useState(true);
  return (
    <div>
      <section className="mitticha-page-intro">
        <span><Bot size={18} /></span>
        <div><b>Asosiy yordam offline</b><p>Test, mavzu va suhbat internetsiz ishlaydi. Reja, yozma ish tahlili va rasm o'qish serverdagi ixtiyoriy OpenAI kalitidan foydalanadi.</p></div>
        <Sparkles className="mitticha-page-sparkle" size={20} />
      </section>
      {!isOpen && <button className="mitticha-page-reopen" type="button" onClick={() => setOpen(true)}>🐣 Suhbatni davom ettirish</button>}
      <MittichaChat isOpen={isOpen} onOpenChange={setOpen} placement="page" />
    </div>
  );
}
