export type AngleMode = "degree" | "radian";

export type CalculationRecord = {
  id: string;
  expression: string;
  result: string;
  angleMode: AngleMode;
  createdAt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isCalculationHistory(value: unknown): value is CalculationRecord[] {
  return Array.isArray(value) && value.every((item: unknown) =>
    isRecord(item)
    && typeof item.id === "string"
    && typeof item.expression === "string"
    && typeof item.result === "string"
    && (item.angleMode === "degree" || item.angleMode === "radian")
    && typeof item.createdAt === "string",
  );
}
