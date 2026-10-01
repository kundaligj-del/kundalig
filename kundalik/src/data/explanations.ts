export type TopicExplanation = {
  fan: string;
  mavzu: string;
  matn: string;
  misollar: [string, string];
};

export const explanations: TopicExplanation[] = [
  {
    fan: "Algebra",
    mavzu: "Chiziqli tenglamalar",
    matn: "Tenglamada noma'lum sonni topishda tenglikning ikkala tomoniga bir xil amalni bajaramiz. Maqsad — x ni yolg'iz qoldirish. Qo'shishning teskarisi ayirish, ko'paytirishning teskarisi bo'lish.",
    misollar: ["x + 4 = 9 → x = 9 - 4 = 5", "3x = 15 → x = 15 ÷ 3 = 5"],
  },
  {
    fan: "Fizika",
    mavzu: "To'g'ri chiziqli harakat",
    matn: "Jism to'g'ri chiziq bo'ylab yurganda tezlik bosib o'tilgan masofaning vaqtga nisbatidir. Asosiy formula: $v = s / t$. Birliklarni mos qo'yishni unutmang.",
    misollar: ["$s = 120$ m, $t = 20$ s → $v = 6$ m/s", "$v = 4$ m/s, $t = 5$ s → $s = v·t = 20$ m"],
  },
  {
    fan: "Fizika",
    mavzu: "Kuch va Nyuton qonunlari",
    matn: "Kuch jism harakatini o'zgartirishi mumkin. Nyutonning ikkinchi qonuniga ko'ra, natijaviy kuch massa va tezlanish ko'paytmasiga teng: $F = m·a$.",
    misollar: ["$m = 2$ kg, $a = 3$ m/s² → $F = 6$ N", "$F = 10$ N, $m = 2$ kg → $a = F/m = 5$ m/s²"],
  },
];
