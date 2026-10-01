import type { ChatMessage } from "@/data/chat";

type AnswerResponse = { answer: string };
type ErrorResponse = { error: string };

function isAnswerResponse(value: unknown): value is AnswerResponse {
  return typeof value === "object" && value !== null
    && "answer" in value && typeof value.answer === "string";
}

function isErrorResponse(value: unknown): value is ErrorResponse {
  return typeof value === "object" && value !== null
    && "error" in value && typeof value.error === "string";
}

// Brauzer faqat shu ichki endpoint bilan gaplashadi, kalit serverda qoladi.
export async function askMitticha(messages: ChatMessage[]): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.map(({ role, content }) => ({ role, content })),
    }),
  });
  const payload: unknown = await response.json();

  if (!response.ok) {
    if (isErrorResponse(payload)) throw new Error(payload.error);
    throw new Error("Mittichaga ulanishda xatolik yuz berdi.");
  }
  if (!isAnswerResponse(payload)) {
    throw new Error("Mittichadan tushunarsiz javob keldi.");
  }
  return payload.answer;
}
