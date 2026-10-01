import dotenv from "dotenv";
import express from "express";
import { translateWithGemini } from "./providers/gemini.js";
import { translateWithDeepL } from "./providers/deepl.js";
import { translateWithMicrosoft } from "./providers/microsoft.js";
import { createAutoHomework, createStudyPlan, explainHomeworkImage, reviewStudentWriting } from "./providers/openai.js";

dotenv.config({ path: [".env.local", ".env"] });

const app = express();
const port = Number(process.env.API_PORT || 3001);
const minute = 60_000;
const requestLimit = 30;
const rateLimits = new Map();
const providers = {
  gemini: translateWithGemini,
  deepl: translateWithDeepL,
  microsoft: translateWithMicrosoft,
};
const allowedLanguages = new Set(["UZ", "EN", "RU"]);
const allowedWritingSubjects = new Set(["Adabiyot", "Ona tili", "Ingliz tili", "Rus tili"]);

app.use("/api/homework-image", (request, response, next) => {
  if (!allowedRequest(`homework-image:${request.ip ?? "unknown"}`, 5)) {
    response.status(429).json({ error: "Rasmli vazifa so'rovlari limiti tugadi. Bir daqiqadan keyin qayta urinib ko'r." });
    return;
  }
  next();
});
app.use("/api/homework-image", express.json({ limit: "1mb" }));
app.use(express.json({ limit: "16kb" }));

function allowedRequest(ip, limit = requestLimit) {
  const now = Date.now();
  const existing = rateLimits.get(ip);
  if (!existing || now - existing.startedAt >= minute) {
    rateLimits.set(ip, { startedAt: now, count: 1 });
    return true;
  }
  existing.count += 1;
  return existing.count <= limit;
}

function validClock(value) {
  if (typeof value !== "string" || !/^\d{2}:\d{2}$/.test(value)) return false;
  const [hour, minuteValue] = value.split(":").map(Number);
  return hour <= 23 && minuteValue <= 59;
}

function validTranslationRequest(body) {
  return typeof body === "object"
    && body !== null
    && typeof body.text === "string"
    && body.text.trim().length > 0
    && body.text.length <= 1000
    && allowedLanguages.has(body.source)
    && allowedLanguages.has(body.target)
    && body.source !== body.target;
}

function validStudyPlanRequest(body) {
  return typeof body === "object"
    && body !== null
    && typeof body.todayDate === "string"
    && /^\d{4}-\d{2}-\d{2}$/.test(body.todayDate)
    && typeof body.tomorrowDate === "string"
    && /^\d{4}-\d{2}-\d{2}$/.test(body.tomorrowDate)
    && validClock(body.currentTime)
    && validClock(body.startAfter)
    && Array.isArray(body.lessons)
    && body.lessons.length <= 12
    && body.lessons.every((lesson) => typeof lesson === "string" && lesson.length <= 80)
    && Array.isArray(body.pendingHomework)
    && body.pendingHomework.length <= 20
    && body.pendingHomework.every((item) => typeof item === "object" && item !== null
      && typeof item.title === "string" && item.title.length > 0 && item.title.length <= 200
      && typeof item.subject === "string" && item.subject.length <= 80
      && (item.dueDate === null || (typeof item.dueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.dueDate))));
}

const autoHomeworkSubjects = new Set([
  "Kelajak soati", "Algebra", "Kimyo", "Geometriya", "Jismoniy tarbiya",
  "Tadbirkorlik asoslari", "ChQBT", "Fizika", "Biologiya", "Ingliz tili",
  "Informatika", "O'zbekiston tarixi", "Rus tili", "Adabiyot",
  "Davlat huquqi asoslari", "Ona tili", "Jahon tarixi", "Tarbiya", "Astronomiya",
]);

function validAutoHomeworkRequest(body) {
  if (typeof body !== "object" || body === null
    || typeof body.targetDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(body.targetDate)
    || typeof body.weekday !== "string" || body.weekday.length > 20
    || !Number.isInteger(body.maxMinutes) || body.maxMinutes < 60 || body.maxMinutes > 180
    || (body.tasksPerSubject !== 1 && body.tasksPerSubject !== 2)
    || !["oson", "aralash", "qiyin"].includes(body.difficulty)
    || !Array.isArray(body.lessons) || body.lessons.length < 1 || body.lessons.length > 12) return false;
  const seen = new Set();
  return body.lessons.every((lesson) => {
    if (typeof lesson !== "object" || lesson === null
      || typeof lesson.fan !== "string" || !autoHomeworkSubjects.has(lesson.fan) || seen.has(lesson.fan)
      || typeof lesson.tur !== "string" || lesson.tur.length < 1 || lesson.tur.length > 100
      || typeof lesson["ko'rsatma"] !== "string" || lesson["ko'rsatma"].length > 200
      || !(lesson.oxirgiMavzu === null || (typeof lesson.oxirgiMavzu === "string" && lesson.oxirgiMavzu.length <= 120))
      || !Number.isInteger(lesson["o'tilganDarslar"]) || lesson["o'tilganDarslar"] < 0 || lesson["o'tilganDarslar"] > 1000
      || typeof lesson.zaxira !== "string" || lesson.zaxira.length > 240
      || typeof lesson.yengil !== "boolean") return false;
    seen.add(lesson.fan);
    return true;
  });
}

function validWritingRequest(body) {
  return typeof body === "object"
    && body !== null
    && allowedWritingSubjects.has(body.subject)
    && typeof body.text === "string"
    && body.text.trim().length >= 30
    && body.text.length <= 3000;
}

function validHomeworkImageRequest(body) {
  return typeof body === "object"
    && body !== null
    && typeof body.imageDataUrl === "string"
    && body.imageDataUrl.length <= 950_000
    && /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(body.imageDataUrl);
}

app.post("/api/homework-image", async (request, response) => {
  if (!validHomeworkImageRequest(request.body)) {
    response.status(400).json({ error: "Rasm JPEG, PNG yoki WebP bo'lishi va kichraytirilgan fayl hajmi me'yorda bo'lishi kerak." });
    return;
  }

  try {
    const explanation = await explainHomeworkImage(request.body.imageDataUrl);
    response.json({ explanation });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Rasmdagi vazifani o'qib bo'lmadi.";
    response.status(message.includes("OPENAI_API_KEY") ? 503 : 502).json({ error: message });
  }
});

app.post("/api/writing-review", async (request, response) => {
  if (!allowedRequest(`writing-review:${request.ip ?? "unknown"}`, 5)) {
    response.status(429).json({ error: "Yozma ish tekshirish limiti tugadi. Bir daqiqadan keyin qayta urinib ko'r." });
    return;
  }
  if (!validWritingRequest(request.body)) {
    response.status(400).json({ error: "Adabiyot, Ona tili, Ingliz tili yoki Rus tilini tanlang va 30–3000 belgilik matn kiriting." });
    return;
  }

  try {
    const review = await reviewStudentWriting({
      subject: request.body.subject,
      text: request.body.text.trim(),
    });
    response.json({ review });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Yozma ishni tekshirib bo'lmadi.";
    response.status(message.includes("OPENAI_API_KEY") ? 503 : 502).json({ error: message });
  }
});

app.post("/api/study-plan", async (request, response) => {
  if (!allowedRequest(`study-plan:${request.ip ?? "unknown"}`, 10)) {
    response.status(429).json({ error: "Reja tuzish limiti tugadi. Bir daqiqadan keyin qayta urinib ko'ring." });
    return;
  }
  if (!validStudyPlanRequest(request.body)) {
    response.status(400).json({ error: "Reja uchun yuborilgan jadval yoki vazifa ma'lumoti noto'g'ri." });
    return;
  }

  try {
    const plan = await createStudyPlan(request.body);
    response.json({ plan });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Reja tuzib bo'lmadi.";
    response.status(message.includes("OPENAI_API_KEY") ? 503 : 502).json({ error: message });
  }
});

app.post("/api/auto-homework", async (request, response) => {
  if (!allowedRequest(`auto-homework:${request.ip ?? "unknown"}`, 4)) {
    response.status(429).json({ error: "Avtomatik vazifalar so'rovi limiti tugadi. Birozdan keyin qayta urin." });
    return;
  }
  if (!validAutoHomeworkRequest(request.body)) {
    response.status(400).json({ error: "Avtomatik vazifa uchun yuborilgan fan yoki sozlamalar noto'g'ri." });
    return;
  }

  try {
    const tasks = await createAutoHomework(request.body);
    response.json({ tasks });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Vazifalarni tuzib bo'lmadi.";
    response.status(message.includes("OPENAI_API_KEY") ? 503 : 502).json({ error: message });
  }
});

app.post("/api/translate", async (request, response) => {
  if (!allowedRequest(request.ip ?? "unknown")) {
    response.status(429).json({ error: "Tarjima so'rovlari limiti tugadi. Bir daqiqadan keyin qayta urinib ko'ring." });
    return;
  }
  if (!validTranslationRequest(request.body)) {
    response.status(400).json({ error: "Matnni (1000 belgigacha) va ikki xil tarjima tilini tanlang." });
    return;
  }

  const providerName = process.env.TRANSLATE_PROVIDER || "gemini";
  const provider = providers[providerName];
  if (!provider) {
    response.status(503).json({ error: "Tanlangan tarjima xizmati tanilmadi. TRANSLATE_PROVIDER sozlamasini tekshiring." });
    return;
  }

  try {
    const translation = await provider({
      text: request.body.text.trim(),
      source: request.body.source,
      target: request.body.target,
    });
    response.json({ translation });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tarjima xizmatiga ulanib bo'lmadi.";
    response.status(502).json({ error: message });
  }
});

app.use((error, _request, response, next) => {
  if (typeof error === "object" && error !== null && "type" in error) {
    if (error.type === "entity.parse.failed") {
      response.status(400).json({ error: "So'rov JSON formati noto'g'ri." });
      return;
    }
    if (error.type === "entity.too.large") {
      response.status(413).json({ error: "So'rov 1000 belgilik limitdan katta." });
      return;
    }
  }
  next(error);
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Ixtiyoriy tarjima serveri http://127.0.0.1:${port} manzilida ishlayapti`);
});
