// Chat xotirasida faqat foydalanuvchi va Mitticha xabarlari saqlanadi.
export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function isChatHistory(value: unknown): value is ChatMessage[] {
  return Array.isArray(value) && value.every((message: unknown) =>
    typeof message === "object"
    && message !== null
    && "id" in message
    && typeof message.id === "string"
    && "role" in message
    && (message.role === "user" || message.role === "assistant")
    && "content" in message
    && typeof message.content === "string",
  );
}
