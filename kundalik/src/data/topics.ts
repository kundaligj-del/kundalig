export type TopicEntry = { fan: string; mavzular: string[] };

// Mavzular ketma-ketligi darslar sonidan hozirgi mavzuni aniqlashga yordam beradi.
export const topics: TopicEntry[] = [
  { fan: "Algebra", mavzular: ["Chiziqli tenglamalar"] },
  { fan: "Fizika", mavzular: ["To'g'ri chiziqli harakat", "Kuch va Nyuton qonunlari"] },
];

export function topicsForSubject(subject: string): string[] {
  return topics.find((entry) => entry.fan === subject)?.mavzular ?? [];
}
