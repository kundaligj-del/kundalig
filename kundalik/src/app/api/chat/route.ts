import { NextResponse } from "next/server";

const SYSTEM_PROMPT = "Sen Mitticha — 11-sinf o'quvchilariga yordam beradigan quvnoq AI yordamchisan. O'zbek tilida javob ber. Uy vazifasini shunchaki yechib berma, o'quvchi o'zi tushunishi uchun qadamma-qadam yo'nalt. Javoblar qisqa, tushunarli va rag'batlantiruvchi bo'lsin.";

type ApiMessage = { role: "user" | "assistant"; content: string };
type ChatRequest = { messages: ApiMessage[] };

function isChatRequest(value: unknown): value is ChatRequest {
  if (typeof value !== "object" || value === null || !("messages" in value) || !Array.isArray(value.messages)) {
    return false;
  }
  return value.messages.length > 0
    && value.messages.length <= 20
    && value.messages.every((message: unknown) =>
      typeof message === "object"
      && message !== null
      && "role" in message
      && (message.role === "user" || message.role === "assistant")
      && "content" in message
      && typeof message.content === "string"
      && message.content.length > 0
      && message.content.length <= 3000,
    );
}

function getAnswer(value: unknown): string | null {
  if (typeof value !== "object" || value === null || !("choices" in value) || !Array.isArray(value.choices)) {
    return null;
  }
  const choice: unknown = value.choices[0];
  if (typeof choice !== "object" || choice === null || !("message" in choice)) return null;
  const message: unknown = choice.message;
  if (typeof message !== "object" || message === null || !("content" in message)) return null;
  return typeof message.content === "string" ? message.content : null;
}

// OpenAI kaliti faqat serverda ishlatiladi; brauzer kalitni hech qachon olmaydi.
export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Serverda OPENAI_API_KEY sozlanmagan. .env.local faylini tekshiring." },
      { status: 503 },
    );
  }

  const body: unknown = await request.json();
  if (!isChatRequest(body)) {
    return NextResponse.json({ error: "Xabarlar formati noto'g'ri yoki juda uzun." }, { status: 400 });
  }

  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...body.messages.map(({ role, content }) => ({ role, content })),
      ],
    }),
  });

  const result: unknown = await upstream.json();
  if (!upstream.ok) {
    return NextResponse.json(
      { error: "OpenAI so'rovi bajarilmadi. .env.local faylidagi kalit va model sozlamalarini tekshiring." },
      { status: 502 },
    );
  }

  const answer = getAnswer(result);
  if (!answer) {
    return NextResponse.json({ error: "AI javobi bo'sh yoki noto'g'ri formatda." }, { status: 502 });
  }
  return NextResponse.json({ answer });
}
