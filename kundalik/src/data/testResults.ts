export type TestResult = {
  id: string;
  date: string;
  subject: string;
  topic: string;
  score: number;
  total: number;
  wrongIds: string[];
};

export function isTestResults(value: unknown): value is TestResult[] {
  return Array.isArray(value) && value.every((item) =>
    typeof item === "object" && item !== null
    && "id" in item && typeof item.id === "string"
    && "date" in item && typeof item.date === "string"
    && "subject" in item && typeof item.subject === "string"
    && "topic" in item && typeof item.topic === "string"
    && "score" in item && typeof item.score === "number"
    && "total" in item && typeof item.total === "number"
    && "wrongIds" in item && Array.isArray(item.wrongIds)
    && item.wrongIds.every((id: unknown) => typeof id === "string"),
  );
}
