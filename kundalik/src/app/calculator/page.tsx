import { useCallback, useEffect, useRef, useState } from "react";
import { Calculator, Clock3, Delete, History, RotateCcw, Sigma } from "lucide-react";
import { RoutePageLayout } from "@/components/RoutePageLayout";
import { isCalculationHistory, type AngleMode, type CalculationRecord } from "@/data/calculator";
import { usePersistentState } from "@/hooks/usePersistentState";
import { evaluateCalculatorExpression } from "@/utils/calculator";

type KeyButton = {
  label: string;
  value?: string;
  action?: "clear" | "delete" | "calculate" | "open";
  kind?: "operator" | "utility" | "equals";
};

const basicRows: KeyButton[][] = [
  [
    { label: "AC", action: "clear", kind: "utility" },
    { label: "(", value: "(" },
    { label: ")", value: ")" },
    { label: "%", value: "%", kind: "operator" },
  ],
  [
    { label: "7", value: "7" }, { label: "8", value: "8" }, { label: "9", value: "9" },
    { label: "÷", value: "÷", kind: "operator" },
  ],
  [
    { label: "4", value: "4" }, { label: "5", value: "5" }, { label: "6", value: "6" },
    { label: "×", value: "×", kind: "operator" },
  ],
  [
    { label: "1", value: "1" }, { label: "2", value: "2" }, { label: "3", value: "3" },
    { label: "−", value: "-", kind: "operator" },
  ],
  [
    { label: "0", value: "0" }, { label: ".", value: "." },
    { label: "⌫", action: "delete", kind: "utility" },
    { label: "+", value: "+", kind: "operator" },
  ],
];

const scientificKeys: KeyButton[][] = [
  [
    { label: "sin", value: "sin(", kind: "utility" },
    { label: "cos", value: "cos(", kind: "utility" },
    { label: "tan", value: "tan(", kind: "utility" },
    { label: "log", value: "log10(", kind: "utility" },
  ],
  [
    { label: "ln", value: "log(", kind: "utility" },
    { label: "√", value: "sqrt(", kind: "utility" },
    { label: "xʸ", value: "^", kind: "utility" },
    { label: "n!", value: "!", kind: "utility" },
  ],
  [
    { label: "π", value: "π", kind: "utility" },
    { label: "e", value: "e", kind: "utility" },
  ],
];

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("uz-UZ", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

// Oddiy va ilmiy amallar, klaviatura boshqaruvi hamda saqlanadigan tarix.
export default function CalculatorPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [angleMode, setAngleMode] = useState<AngleMode>("degree");
  const [scientific, setScientific] = useState(false);
  const [history, updateHistory] = usePersistentState<CalculationRecord[]>(
    "kundalik-calculator-history", isCalculationHistory, [],
  );

  const clear = useCallback(() => {
    setExpression("");
    setResult("");
    setError("");
  }, []);

  const calculate = useCallback(() => {
    try {
      const answer = evaluateCalculatorExpression(expression, angleMode);
      setResult(answer);
      setError("");
      updateHistory((current) => [{
        id: crypto.randomUUID(),
        expression,
        result: answer,
        angleMode,
        createdAt: new Date().toISOString(),
      }, ...current].slice(0, 20));
    } catch (reason) {
      setResult("");
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  }, [angleMode, expression, updateHistory]);

  const append = useCallback((value: string) => {
    setExpression((current) => `${current}${value}`);
    setError("");
  }, []);

  useEffect(() => {
    function handleKeyboard(event: KeyboardEvent) {
      if (event.target === inputRef.current) {
        if (event.key === "Enter") {
          event.preventDefault();
          calculate();
        } else if (event.key === "Escape") {
          clear();
        }
        return;
      }
      if (/^[0-9.+\-*/%^()!]$/.test(event.key)) {
        event.preventDefault();
        append(event.key);
      } else if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        calculate();
      } else if (event.key === "Backspace") {
        event.preventDefault();
        setExpression((current) => current.slice(0, -1));
      } else if (event.key === "Escape" || event.key === "Delete") {
        event.preventDefault();
        clear();
      }
    }
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [append, calculate, clear]);

  function handleButton(button: KeyButton) {
    if (button.action === "clear") clear();
    else if (button.action === "delete") {
      setExpression((current) => current.slice(0, -1));
      setError("");
    } else if (button.action === "calculate") calculate();
    else if (button.value) append(button.value);
  }

  function addHistoryEntry(record: CalculationRecord) {
    setExpression(record.expression);
    setResult(record.result);
    setError("");
    setAngleMode(record.angleMode);
  }

  function clearHistory() {
    updateHistory(() => []);
  }

  return (
    <RoutePageLayout
      eyebrow="HISOB-KITOB"
      title="Kalkulyator"
      description="Oddiy amallar yoki ilmiy funksiyalarni hisobla. Klaviaturadan ham foydalanishing mumkin."
    >
      <div className="calculator-layout">
        <section className="calculator-card">
          <div className="calculator-card-heading">
            <span className="calculator-heading-icon"><Calculator size={18} /></span>
            <div><h2>Hisoblash maydoni</h2><p>Enter — hisoblash · Esc — tozalash</p></div>
            <button
              type="button"
              className={`calculator-mode-button ${scientific ? "calculator-mode-active" : ""}`}
              onClick={() => setScientific((current) => !current)}
              aria-pressed={scientific}
            >
              <Sigma size={15} /> {scientific ? "Ilmiy" : "Oddiy"}
            </button>
          </div>

          <div className="calculator-display">
            <label htmlFor="calculator-expression">Ifoda</label>
            <input
              id="calculator-expression"
              ref={inputRef}
              value={expression}
              onChange={(event) => { setExpression(event.target.value); setError(""); }}
              placeholder="Masalan: sin(30) + 2^3"
              autoComplete="off"
              spellCheck={false}
            />
            <div className={`calculator-result-line ${error ? "calculator-result-error" : ""}`}>
              <span>{error || (result ? "Natija" : "Javob shu yerda chiqadi")}</span>
              <output aria-live="polite">{error ? "!" : result || "0"}</output>
            </div>
          </div>

          <div className={`calculator-tools ${scientific ? "calculator-tools-scientific" : ""}`}>
            {scientific && (
              <div className="scientific-keys" aria-label="Ilmiy amallar">
                {scientificKeys.map((row, rowIndex) => (
                  <div className="calculator-key-row" key={`scientific-${rowIndex}`}>
                    {row.map((button) => (
                      <button className={`calculator-key ${button.kind ?? ""}`} key={button.label} type="button" onClick={() => handleButton(button)} aria-label={button.label}>
                        {button.label}
                      </button>
                    ))}
                    {rowIndex === 2 && (
                      <button
                        className="calculator-key calculator-angle-key"
                        type="button"
                        onClick={() => setAngleMode((current) => current === "degree" ? "radian" : "degree")}
                        aria-label="Burchak o'lchovini almashtirish"
                      >
                        {angleMode === "degree" ? "DEG" : "RAD"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="basic-keys" aria-label="Asosiy amallar">
              {basicRows.map((row, rowIndex) => (
                <div className="calculator-key-row" key={`basic-${rowIndex}`}>
                  {row.map((button) => (
                    <button
                      className={`calculator-key ${button.kind ?? ""}`}
                      key={button.label}
                      type="button"
                      onClick={() => handleButton(button)}
                      aria-label={button.label === "⌫" ? "Oxirgi belgini o'chirish" : button.label}
                    >
                      {button.label === "⌫" ? <Delete size={17} /> : button.label}
                    </button>
                  ))}
                </div>
              ))}
              <button className="calculator-equals" type="button" onClick={calculate}>=</button>
            </div>
          </div>
          <p className="calculator-footnote"><RotateCcw size={12} /> Ruxsat etilgan amallar bilan xavfsiz hisoblanadi.</p>
        </section>

        <aside className="calculator-history-card">
          <div className="calculator-history-heading">
            <div><span className="calculator-heading-icon history-icon"><History size={17} /></span><h2>Hisoblash tarixi</h2></div>
            <button type="button" onClick={clearHistory} disabled={history.length === 0} aria-label="Tarixni tozalash"><Delete size={15} /></button>
          </div>
          {history.length === 0 ? (
            <div className="calculator-history-empty"><Clock3 size={22} /><p>Hisob-kitoblaring shu yerda saqlanadi.</p></div>
          ) : (
            <div className="calculator-history-list">
              {history.map((record) => (
                <button type="button" className="calculator-history-item" key={record.id} onClick={() => addHistoryEntry(record)}>
                  <span className="calculator-history-meta">{formatTime(record.createdAt)} · {record.angleMode === "degree" ? "DEG" : "RAD"}</span>
                  <span className="calculator-history-expression">{record.expression}</span>
                  <b>= {record.result}</b>
                </button>
              ))}
            </div>
          )}
        </aside>
      </div>
    </RoutePageLayout>
  );
}
