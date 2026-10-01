export type BellReminderSettings = {
  enabled: boolean;
  leadMinutes: number;
  browserNotifications: boolean;
};

export const defaultBellReminderSettings: BellReminderSettings = {
  enabled: true,
  leadMinutes: 5,
  browserNotifications: false,
};

// Local xotiradagi eslatma sozlamalarini xavfsiz tekshiradi.
export function isBellReminderSettings(value: unknown): value is BellReminderSettings {
  if (typeof value !== "object" || value === null
    || !("enabled" in value) || typeof value.enabled !== "boolean"
    || !("leadMinutes" in value) || typeof value.leadMinutes !== "number"
    || !("browserNotifications" in value) || typeof value.browserNotifications !== "boolean") return false;
  return [1, 3, 5, 10, 15].includes(value.leadMinutes);
}
