export type MittichaSettings = {
  lessonsPerTopic: number;
  manualTopics: Record<string, string>;
};

export const defaultMittichaSettings: MittichaSettings = {
  lessonsPerTopic: 4,
  manualTopics: {},
};

export function isMittichaSettings(value: unknown): value is MittichaSettings {
  if (typeof value !== "object" || value === null || !("lessonsPerTopic" in value)
    || typeof value.lessonsPerTopic !== "number" || value.lessonsPerTopic < 1
    || value.lessonsPerTopic > 30 || !("manualTopics" in value)
    || typeof value.manualTopics !== "object" || value.manualTopics === null
    || Array.isArray(value.manualTopics)) return false;
  return Object.values(value.manualTopics).every((topic) => typeof topic === "string");
}
