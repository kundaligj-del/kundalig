export type MittichaMode = "offline" | "ai";

export function getMittichaMode(): MittichaMode {
  return "offline";
}

// Offline rejim savol banki va mahalliy qoidalar bilan ishlaydi; tarmoq so'rovi yo'q.
export function respondOffline(message: string): string {
  return message.trim()
    ? "Buni tushunmadim 🙈 Pastdagi tugmalardan birini tanla, yoki savolingni boshqacha yozib ko'r."
    : "Savolingni yoz yoki menyudagi tugmalardan birini tanla.";
}

// Kelajakda AI qo'shilsa, uni alohida xavfsiz xizmat sifatida ulash mumkin.
export async function respondWithMode(mode: MittichaMode, message: string): Promise<string> {
  if (mode === "offline") return respondOffline(message);
  throw new Error("AI rejimi hali ulanmagan. Mitticha hozir to'liq offline ishlayapti.");
}
