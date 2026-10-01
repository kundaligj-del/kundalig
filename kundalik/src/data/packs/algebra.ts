import type { StudyPack } from "./types";

// Yangi mavzu qo'shish uchun shu ro'yxatga yana bitta paket qo'shing.
export const algebraPacks: StudyPack[] = [
  {
    fan: "Algebra",
    mavzu: "Chiziqli tenglamalar",
    testlar: [
      { id: "alg-linear-01", savol: "$x + 7 = 12$ bo'lsa, $x$ nechaga teng?", variantlar: ["3", "5", "7", "19"], togri: 1, ishora: "$x$ ni yolg'iz qoldirish uchun 7 ni qarama-qarshi amal bilan o'tkazing.", izoh: "$x = 12 - 7 = 5$." },
      { id: "alg-linear-02", savol: "$3x = 21$ tenglamaning yechimini toping.", variantlar: ["6", "7", "18", "24"], togri: 1, ishora: "Ikkala tomonni 3 ga bo'ling.", izoh: "$x = 21 / 3 = 7$." },
      { id: "alg-linear-03", savol: "$2x - 4 = 10$ bo'lsa, $x$ ni toping.", variantlar: ["3", "7", "8", "12"], togri: 1, ishora: "Avval ikkala tomonga 4 qo'shing.", izoh: "$2x = 14$, demak $x = 7$. Tekshiruv: $2·7 - 4 = 10$." },
      { id: "alg-linear-04", savol: "$5x + 2 = 17$ tenglamada $x$ nechaga teng?", variantlar: ["2", "3", "4", "5"], togri: 1, ishora: "Avval 2 ni ayiring, keyin 5 ga bo'ling.", izoh: "$5x = 15$, shuning uchun $x = 3$." },
      { id: "alg-linear-05", savol: "$4(x - 2) = 12$ tenglamani yeching.", variantlar: ["1", "3", "5", "8"], togri: 2, ishora: "Ikkala tomonni 4 ga bo'lib, so'ng 2 ni qo'shing.", izoh: "$x - 2 = 3$, demak $x = 5$." },
      { id: "alg-linear-06", savol: "$7 - x = 2$ bo'lsa, $x$ nechaga teng?", variantlar: ["-5", "2", "5", "9"], togri: 2, ishora: "7 dan qaysi sonni ayirsak 2 qoladi?", izoh: "$7 - x = 2$ dan $x = 5$ chiqadi." },
      { id: "alg-linear-07", savol: "$2x + 3 = x + 9$ tenglamani yeching.", variantlar: ["3", "6", "9", "12"], togri: 1, ishora: "$x$ li hadlarni bir tomonga, sonlarni ikkinchi tomonga yig'ing.", izoh: "$2x - x = 9 - 3$, demak $x = 6$." },
      { id: "alg-linear-08", savol: "$x/3 + 2 = 6$ tenglamada $x$ ni toping.", variantlar: ["4", "8", "12", "18"], togri: 2, ishora: "Avval 2 ni ayiring, keyin natijani 3 ga ko'paytiring.", izoh: "$x/3 = 4$, demak $x = 12$." },
      { id: "alg-linear-09", savol: "$0.5x = 4$ tenglamani yeching.", variantlar: ["2", "4", "8", "16"], togri: 2, ishora: "0.5 ga bo'lish — 2 ga ko'paytirish bilan teng.", izoh: "$x = 4 / 0.5 = 8$." },
      { id: "alg-linear-10", savol: "$3(x + 1) = 2x + 8$ bo'lsa, $x$ ni toping.", variantlar: ["3", "4", "5", "11"], togri: 2, ishora: "Qavsni ochib, $x$ larni bir tomonga o'tkazing.", izoh: "$3x + 3 = 2x + 8$, demak $x = 5$. Tekshiruvda ikkala tomon ham 18 chiqadi." },
    ],
    uyVazifa: {
      id: "alg-homework-linear-01",
      matn: "Tenglamani yeching: $4(2x - 3) = 20$. Yechim bosqichlarini yozib, javobni tekshiring.",
      qiyinlik: "o'rta",
      taxminiyVaqt: 12,
      ishoralar: [
        "Qavsni ochishdan oldin tenglamaning ikkala tomonini 4 ga bo'lish ham mumkin.",
        "2x - 3 = 5 ko'rinishidan boshlang.",
        "Endi ikkala tomonga 3 qo'shib, so'ng 2 ga bo'ling.",
      ],
      namunaYechim: "$4(2x - 3) = 20 \\rightarrow 2x - 3 = 5 \\rightarrow 2x = 8 \\rightarrow x = 4$. Tekshiruv: $4(8 - 3) = 20$.",
      tekshirishKaliti: "x = 4",
    },
  },
];
