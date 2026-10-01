import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowLeftRight, BookOpen, Check, Copy, Languages, LoaderCircle, Search,
  Sparkles, Star, Trash2, Volume2, Wifi, WifiOff,
} from "lucide-react";
import { RoutePageLayout } from "@/components/RoutePageLayout";
import {
  dictionary, dictionaryCategories, matchDictionary,
  type DictionaryCategory, type DictionaryEntry, type TranslatorLanguage,
} from "@/data/dictionary";
import { findDictionaryEntries, translateOnline, type OnlineLanguage } from "@/services/translate";
import { usePersistentState } from "@/hooks/usePersistentState";
import "./translator.css";

type TranslationRecord = {
  id: string;
  text: string;
  translation: string;
  source: TranslatorLanguage;
  target: TranslatorLanguage;
  createdAt: string;
};

type Favorite = {
  text: string;
  translation: string;
  source: TranslatorLanguage;
  target: TranslatorLanguage;
};

const languageNames: Record<TranslatorLanguage, string> = { uz: "O'zbekcha", en: "English", ru: "Русский" };
const languageSpeechTags: Record<TranslatorLanguage, string> = { uz: "uz", en: "en", ru: "ru" };
const apiLanguageCode: Record<TranslatorLanguage, OnlineLanguage> = { uz: "UZ", en: "EN", ru: "RU" };
const isLanguage = (value: unknown): value is TranslatorLanguage => value === "uz" || value === "en" || value === "ru";
function getLanguage(value: string | null, fallback: TranslatorLanguage): TranslatorLanguage {
  const language = value?.toLowerCase();
  return isLanguage(language) ? language : fallback;
}

function isHistory(value: unknown): value is TranslationRecord[] {
  return Array.isArray(value) && value.every((item) => typeof item === "object" && item !== null
    && "id" in item && typeof item.id === "string" && "text" in item && typeof item.text === "string"
    && "translation" in item && typeof item.translation === "string"
    && "source" in item && isLanguage(item.source) && "target" in item && isLanguage(item.target)
    && "createdAt" in item && typeof item.createdAt === "string");
}

function isFavorites(value: unknown): value is Favorite[] {
  return Array.isArray(value) && value.every((item) => typeof item === "object" && item !== null
    && "text" in item && typeof item.text === "string"
    && "translation" in item && typeof item.translation === "string"
    && "source" in item && isLanguage(item.source) && "target" in item && isLanguage(item.target));
}

function isKnownCards(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("uz-UZ", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function entryKey(entry: DictionaryEntry): string {
  return `${entry.fan}:${entry.uz}:${entry.en}:${entry.ru}`;
}

function makeId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function TranslatorPage() {
  const [searchParams] = useSearchParams();
  const [source, setSource] = useState<TranslatorLanguage>(() => getLanguage(searchParams.get("from"), "uz"));
  const [target, setTarget] = useState<TranslatorLanguage>(() => getLanguage(searchParams.get("to"), "en"));
  const [speechReady, setSpeechReady] = useState(false);
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "dictionary" | "online">("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [category, setCategory] = useState<DictionaryCategory>("English");
  const [search, setSearch] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [history, updateHistory] = usePersistentState<TranslationRecord[]>(
    "kundalik-translator-history", isHistory, [],
  );
  const [favorites, updateFavorites] = usePersistentState<Favorite[]>(
    "kundalik-translator-favorites", isFavorites, [],
  );
  const [knownCards, updateKnownCards] = usePersistentState<string[]>(
    "kundalik-translator-known-cards", isKnownCards, [],
  );

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const updateAvailableVoices = () => {
      setSpeechReady(window.speechSynthesis.getVoices()
        .some((voice) => voice.lang.toLowerCase().startsWith(languageSpeechTags[target])));
    };
    const timer = window.setTimeout(updateAvailableVoices, 0);
    window.speechSynthesis.addEventListener("voiceschanged", updateAvailableVoices);
    return () => {
      window.clearTimeout(timer);
      window.speechSynthesis.removeEventListener("voiceschanged", updateAvailableVoices);
    };
  }, [target]);

  useEffect(() => {
    const query = text.trim();
    const controller = new AbortController();
    let requestTimer = 0;
    const prepareTimer = window.setTimeout(() => {
      setError("");
      setCopied(false);
      if (!query) {
        setResult("");
        setStatus("idle");
        return;
      }
      if (source === target) {
        setResult(query);
        setStatus("dictionary");
        updateHistory((current) => [{
          id: makeId(), text: query, translation: query, source, target, createdAt: new Date().toISOString(),
        }, ...current].slice(0, 50));
        return;
      }

      const match = matchDictionary(query, source, target);
      if (match) {
        setResult(match[target]);
        setStatus("dictionary");
        updateHistory((current) => [{
          id: makeId(), text: query, translation: match[target], source, target,
          createdAt: new Date().toISOString(),
        }, ...current].slice(0, 50));
        return;
      }

      setResult("");
      setStatus("loading");
      requestTimer = window.setTimeout(() => {
        void translateOnline(
          query,
          apiLanguageCode[source],
          apiLanguageCode[target],
          controller.signal,
        )
          .then((translation) => {
            if (controller.signal.aborted) return;
            setResult(translation);
            setStatus("online");
            updateHistory((current) => [{
              id: makeId(), text: query, translation, source, target, createdAt: new Date().toISOString(),
            }, ...current].slice(0, 50));
          })
          .catch((reason: unknown) => {
            if (controller.signal.aborted) return;
            setResult("");
            setStatus("idle");
            setError(reason instanceof Error ? reason.message : "Tarjima amalga oshmadi. Qayta urinib ko'ring.");
          });
      }, 450);
    }, 0);
    return () => {
      window.clearTimeout(prepareTimer);
      window.clearTimeout(requestTimer);
      controller.abort();
    };
  }, [source, target, text, updateHistory]);

  const visibleCards = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const matchingKeys = new Set(findDictionaryEntries(search).map(entryKey));
    return dictionary.filter((entry) => entry.fan === category
      && (!favoritesOnly || favorites.some((favorite) =>
        favorite.text === entry.uz || favorite.text === entry.en || favorite.text === entry.ru))
      && (!query || matchingKeys.has(entryKey(entry)) || [entry.uz, entry.en, entry.ru, entry.misol].some((value) =>
        value.toLocaleLowerCase().includes(query))));
  }, [category, favorites, favoritesOnly, search]);

  const currentIsFavorite = favorites.some((item) => item.text === text.trim()
    && item.source === source && item.target === target);

  function swapLanguages() {
    setSource(target);
    setTarget(source);
    setText((current) => result || current);
  }

  async function copyTranslation() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("Nusxa olish uchun brauzer clipboard ruxsati kerak.");
    }
  }

  function speakTranslation() {
    if (!result || !("speechSynthesis" in window)) {
      setError("Bu brauzerda ovozli o'qish mavjud emas.");
      return;
    }
    const voice = window.speechSynthesis.getVoices()
      .find((candidate) => candidate.lang.toLowerCase().startsWith(languageSpeechTags[target]));
    if (!voice) {
      setError(`${languageNames[target]} uchun mos ovoz bu qurilmada topilmadi.`);
      return;
    }
    setError("");
    const utterance = new SpeechSynthesisUtterance(result);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function toggleFavorite() {
    if (!text.trim() || !result) return;
    if (currentIsFavorite) {
      if (!window.confirm("Bu so'zni mening lug'atimdan o'chiraymi?")) return;
      updateFavorites((current) => current.filter((item) => !(item.text === text.trim()
        && item.source === source && item.target === target)));
    } else {
      const favorite = { text: text.trim(), translation: result, source, target };
      updateFavorites((current) => [favorite, ...current].slice(0, 100));
    }
  }

  function loadHistoryItem(item: TranslationRecord) {
    setSource(item.source);
    setTarget(item.target);
    setText(item.text);
  }

  function toggleCard(entry: DictionaryEntry) {
    const key = entryKey(entry);
    setFlippedCards((current) => current.includes(key)
      ? current.filter((item) => item !== key) : [...current, key]);
  }

  function markCard(entry: DictionaryEntry, knew: boolean) {
    const key = entryKey(entry);
    updateKnownCards((current) => knew
      ? current.includes(key) ? current : [...current, key]
      : current.filter((item) => item !== key));
    setFlippedCards((current) => current.filter((item) => item !== key));
  }

  function clearHistory() {
    if (history.length && window.confirm("Tarjima tarixini butunlay tozalaysizmi?")) {
      updateHistory(() => []);
    }
  }

  function selectDictionaryEntry(entry: DictionaryEntry) {
    setSource("uz");
    setTarget("en");
    setText(entry.uz);
  }

  return (
    <RoutePageLayout
      eyebrow="TIL VA LUG'AT"
      title="Tarjimon"
      description="O'zbekcha, inglizcha va ruscha tarjima qil, fan atamalarini yodla va foydali so'zlaringni saqla."
    >
      <div className="translator-layout">
        <section className="translator-panel" aria-label="Matn tarjimasi">
          <div className="translator-panel-title">
            <span className="translator-icon"><Languages size={19} /></span>
            <div><h2>Matn tarjimasi</h2><p>Lug'atdan tezkor tarjima yoki gaplar uchun onlayn yordam</p></div>
            <span className={`translator-status ${status === "online" ? "is-online" : ""}`}>
              {status === "loading" ? <LoaderCircle size={13} className="translator-spin" /> :
                status === "online" ? <Wifi size={13} /> : <WifiOff size={13} />}
              {status === "loading" ? "Tarjima qilinmoqda" : status === "online" ? "Onlayn" : "Lug'at"}
            </span>
          </div>

          <div className="translator-language-row">
            <label className="translator-language">
              <span>Tarjima qilish</span>
              <select aria-label="Asl til" value={source} onChange={(event) => setSource(event.target.value as TranslatorLanguage)}>
                {(Object.keys(languageNames) as TranslatorLanguage[]).map((language) =>
                  <option key={language} value={language}>{languageNames[language]}</option>)}
              </select>
            </label>
            <button className="translator-swap" type="button" onClick={swapLanguages} aria-label="Tillarni almashtirish">
              <ArrowLeftRight size={18} />
            </button>
            <label className="translator-language">
              <span>Tarjima natijasi</span>
              <select aria-label="Tarjima tili" value={target} onChange={(event) => setTarget(event.target.value as TranslatorLanguage)}>
                {(Object.keys(languageNames) as TranslatorLanguage[]).map((language) =>
                  <option key={language} value={language}>{languageNames[language]}</option>)}
              </select>
            </label>
          </div>

          <div className="translator-editors">
            <label className="translator-editor">
              <span className="translator-field-label">Matn</span>
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value.slice(0, 1000))}
                placeholder="Tarjima qilinadigan so'z yoki gapni yoz..."
                maxLength={1000}
                rows={5}
                aria-label="Tarjima qilinadigan matn"
              />
              <span className="translator-char-count">{text.length}/1000</span>
            </label>
            <section className={`translator-editor translator-output ${error ? "has-error" : ""}`} aria-live="polite">
              <span className="translator-field-label">Tarjima</span>
              <div className="translator-output-text">
                {status === "loading" && !result
                  ? <span className="translator-placeholder"><LoaderCircle size={16} className="translator-spin" /> Tarjima tayyorlanmoqda...</span>
                  : error ? <span className="translator-error">{error}</span>
                    : result || <span className="translator-placeholder">Natija shu yerda ko'rinadi</span>}
              </div>
              <div className="translator-result-actions">
                <button type="button" onClick={() => void copyTranslation()} disabled={!result} aria-label="Tarjimadan nusxa olish">
                  {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Nusxalandi" : "Nusxa"}
                </button>
                {speechReady && <button type="button" onClick={speakTranslation} disabled={!result} aria-label="Tarjimani ovoz chiqarib o'qish">
                  <Volume2 size={16} /> O'qish
                </button>}
                <button
                  type="button"
                  className={currentIsFavorite ? "is-favorite" : ""}
                  onClick={toggleFavorite}
                  disabled={!result}
                  aria-label={currentIsFavorite ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo'shish"}
                  aria-pressed={currentIsFavorite}
                >
                  <Star size={16} fill={currentIsFavorite ? "currentColor" : "none"} /> Saqlash
                </button>
              </div>
            </section>
          </div>
          <div className="translator-footnote">
            <Sparkles size={14} />
            <span>So'zlar offline lug'atdan, gaplar esa 0,45 soniyalik kutishdan so'ng xizmat orqali tarjima qilinadi.</span>
          </div>
        </section>

        <section className="translator-panel translator-vocabulary">
          <div className="translator-section-heading">
            <div>
              <span className="translator-icon"><BookOpen size={18} /></span>
              <div><h2>Fan lug'ati</h2><p>{dictionary.length} ta ta'lim atamasi · kategoriya bo'yicha o'rgan</p></div>
            </div>
            <span className="translator-known-count">{knownCards.length} bilaman</span>
          </div>
          <div className="translator-category-row" role="group" aria-label="Lug'at kategoriyasi">
            {dictionaryCategories.map((item) => (
              <button key={item} type="button" className={category === item ? "active" : ""}
                onClick={() => setCategory(item)} aria-pressed={category === item}>{item}</button>
            ))}
          </div>
          <div className="translator-vocab-tools">
            <label className="translator-search">
              <Search size={16} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Atama yoki misolni qidir..." aria-label="Lug'atdan qidirish" />
            </label>
            <button type="button" className={`translator-filter ${favoritesOnly ? "active" : ""}`}
              onClick={() => setFavoritesOnly((current) => !current)} aria-pressed={favoritesOnly}>
              <Star size={15} /> Sevimlilar
            </button>
          </div>
          <div className="translator-cards-grid">
            {visibleCards.map((entry) => {
              const key = entryKey(entry);
              const flipped = flippedCards.includes(key);
              const known = knownCards.includes(key);
              return (
                <article className={`translator-flashcard ${flipped ? "flipped" : ""}`} key={key}>
                  <button type="button" className="translator-card-face" onClick={() => toggleCard(entry)}
                    aria-label={`${flipped ? "Asl atama" : "Tarjimani"} ko'rsatish: ${entry.uz}`}>
                    <span className="translator-card-category">{entry.fan}{known && <b>Bilaman</b>}</span>
                    <strong>{flipped ? entry[target] : entry[source]}</strong>
                    <span className="translator-card-hint">{flipped ? entry.misol : "Ochish uchun bosing"}</span>
                  </button>
                  {flipped && (
                    <div className="translator-card-controls">
                      <button type="button" onClick={() => markCard(entry, true)}><Check size={13} /> Bilaman</button>
                      <button type="button" onClick={() => markCard(entry, false)}><BookOpen size={13} /> Bilmayman</button>
                    </div>
                  )}
                  <button type="button" className="translator-card-translate" onClick={() => selectDictionaryEntry(entry)}
                    title="Tarjimon oynasida ko'rish">Tarjimaga o'tkaz</button>
                </article>
              );
            })}
            {visibleCards.length === 0 && <p className="translator-empty">Bu qidiruvga mos atama topilmadi.</p>}
          </div>
        </section>

        <section className="translator-panel translator-history">
          <div className="translator-section-heading">
            <div>
              <span className="translator-icon"><Languages size={18} /></span>
              <div><h2>Tarjima tarixi</h2><p>Oxirgi 50 ta tarjima shu qurilmada saqlanadi</p></div>
            </div>
            <button type="button" className="translator-clear-history" onClick={clearHistory}
              disabled={history.length === 0}><Trash2 size={15} /> Tozalash</button>
          </div>
          {history.length === 0 ? <p className="translator-empty-history">Tarjimalar tarixda shu yerda ko'rinadi.</p> : (
            <div className="translator-history-list">
              {history.map((item) => (
                <button type="button" className="translator-history-item" key={item.id} onClick={() => loadHistoryItem(item)}>
                  <span className="translator-history-meta">{languageNames[item.source]} → {languageNames[item.target]} · {formatTime(item.createdAt)}</span>
                  <span>{item.text}</span><b>{item.translation}</b>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="translator-panel translator-history">
          <div className="translator-section-heading">
            <div>
              <span className="translator-icon"><Star size={18} /></span>
              <div><h2>Saqlangan tarjimalar</h2><p>{favorites.length} ta sevimli tarjima</p></div>
            </div>
          </div>
          {favorites.length === 0 ? <p className="translator-empty-history">Yulduz tugmasini bosib tarjimalarni saqlab qo'y.</p> : (
            <div className="translator-history-list">
              {favorites.map((item, index) => (
                <div className="translator-favorite-item" key={`${item.source}-${item.target}-${item.text}-${index}`}>
                  <button type="button" className="translator-favorite-open" onClick={() => {
                    setSource(item.source);
                    setTarget(item.target);
                    setText(item.text);
                  }}>
                    <span className="translator-history-meta">{languageNames[item.source]} → {languageNames[item.target]}</span>
                    <span>{item.text}</span><b>{item.translation}</b>
                  </button>
                  <button type="button" className="translator-favorite-remove" aria-label="Sevimlidan olib tashlash"
                    onClick={() => {
                      if (window.confirm("Bu so'zni mening lug'atimdan o'chiraymi?")) {
                        updateFavorites((current) => current.filter((favorite) =>
                          !(favorite.text === item.text && favorite.source === item.source && favorite.target === item.target)));
                      }
                    }}>
                    <Star size={15} fill="currentColor" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </RoutePageLayout>
  );
}
