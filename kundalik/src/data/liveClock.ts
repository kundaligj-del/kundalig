// Jonli soat ko'rinishini o'quvchi tanlovlari bilan saqlaydi.
export type LiveClockSettings = {
  format: "24h" | "12h";
  showSeconds: boolean;
};

export const defaultLiveClockSettings: LiveClockSettings = {
  format: "24h",
  showSeconds: true,
};

export function isLiveClockSettings(value: unknown): value is LiveClockSettings {
  return typeof value === "object" && value !== null
    && "format" in value && (value.format === "24h" || value.format === "12h")
    && "showSeconds" in value && typeof value.showSeconds === "boolean";
}
