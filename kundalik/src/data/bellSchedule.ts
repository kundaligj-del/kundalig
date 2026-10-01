// Dars qo'ng'iroqlari va katta tanaffus vaqtlari shu ro'yxatda saqlanadi.
export const bellSchedule = [
  { tartib: 1, boshlanish: "08:00", tugash: "08:45" },
  { tartib: 2, boshlanish: "08:45", tugash: "09:30" },
  { tartib: 3, boshlanish: "09:30", tugash: "10:15" },
  // 10:15 - 10:30 katta tanaffus (15 daqiqa)
  { tartib: 4, boshlanish: "10:30", tugash: "11:15" },
  { tartib: 5, boshlanish: "11:15", tugash: "12:00" },
  { tartib: 6, boshlanish: "12:00", tugash: "12:45" },
] as const;

export const katta_tanaffus = { boshlanish: "10:15", tugash: "10:30" } as const;
